import { hash, compare, genSalt } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { SECRET_KEY, CLIENT_URL, ORIGIN,NODE_ENV } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { UserType } from '@/interfaces/type';
import User, {
  Admin,
  GemAdmin,
  Farmer,
  GemExcite,
  Miner,
  Offtaker,
} from '@models/users.model';
import { IUser } from '@/interfaces/users.interface';
import { isEmpty } from '@utils/util';
import {
  loginDto,
  resendVerificationDto,
  signupDto,
  updatePasswordDto,
} from '@/validator/auth.validator';
import { offtakerOnboardingDto } from '@/validator/offtaker.validator';
import EmailService from './email.service';

class AuthService {
  public users = User;
  public offtaker = Offtaker;
  public farmer = Farmer;
  public miner = Miner;
  public gemExcite = GemExcite;
  public admin = Admin;
  public gemAdmin = GemAdmin;

  public emailService = new EmailService();

  public async signup(userData: signupDto['body']) {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');
  //  console.log(userData)
    const findUser: IUser = await this.users.findOne({ email: userData.email });
    if (findUser)
      throw new HttpException(
        409,
        `This email ${userData.email} already exists`
      );

    // const del = await this.users.findOneAndDelete({ email: userData.email }).exec();
    // if (del)
    //   throw new HttpException(
    //     409,
    //     `This email ${userData.email} has been deleted`
    //   );

    // if (!findUser) {console.log(`${userData.email} is about to be created! ${del}`);
    //   throw new HttpException(401, "It worked")
    // }

    const hashedPassword = await hash(userData.password, 10);

    let user: IUser;
    switch (userData.userType) {
      case 'Farmer':
        user = await this.farmer.create({
          ...userData,
          password: hashedPassword,
        });
        break;
      case 'Miner':
        user = await this.miner.create({
          ...userData,
          password: hashedPassword,
        });
        break;
      // case 'GemExcite':
      //   user = await this.gemExcite.create({
      //     ...userData,
      //     password: hashedPassword,
      //   });
      //   break;
      case 'Offtaker':
        user = await this.offtaker.create({
          ...userData,
          password: hashedPassword,
        });
        break;
      case 'Admin':
        user = await this.admin.create({
          ...userData,
          password: hashedPassword,
        });
        break;
      case 'GemAdmin':
        user = await this.gemAdmin.create({
          ...userData,
          password: hashedPassword,
        });
        break;
      default:
        throw new HttpException(400, `Invalid user type`);
    }

    user.confirmationCode = this.createToken(user).token;
    await user.save();

    this.emailService
      .sendEmail({
        to: user.email,
        subject: 'Verify email address',
        body: `Click on confirmation link: ${NODE_ENV === 'development'? ORIGIN:CLIENT_URL}/auth/verify-email/verify/${user.confirmationCode}`,
      })
      .then((res) => {
        return { ...user, password: undefined, confirmationCode: undefined };
      })
      .catch((err) => {
        throw new HttpException(400, 'Error sending confirmation mail');
      });
  };

  public async verifyUser(confirmationCode: string): Promise<IUser> {
    if (isEmpty(confirmationCode))
      throw new HttpException(400, 'confirmation code is empty');

    const findUser: IUser = await this.users
      .findOne({ confirmationCode })
      .exec();

    if (!findUser) {
      throw new HttpException(401, 'Invalid token')
    };

    findUser.isVerified = true;
    findUser.confirmationCode = undefined;
    const verifiedUser = await findUser.save();

    if (['GemExcite', 'StoreKeeper'].includes(verifiedUser.userType)) {
      ///  Generate Salt for hashing;
      const salt = await genSalt(10);

      //Send login details to User to enable sign-in
      this.emailService.sendEmail({
        to: verifiedUser.email,
        subject: 'Your Login Details',
        body: `Hi ${verifiedUser.userType} <br/> Welcome to ExciteTrade. Please login with these details and <h3>reset your password immediately</h3>find your Login details below: <br/> email: ${verifiedUser.email} <br/> password: ${verifiedUser.password}`,
      }).then(res => {
        console.log('Login details sent successfully')
      }).catch(err => {
        throw new HttpException(400, 'Error sending confirmation email, Please Refresh the page again')
      })

      // ---- hash the password *after* the email is sent ----
      const hashed = await hash(verifiedUser.password, salt);
      verifiedUser.password = hashed;
      await verifiedUser.save();
    }

    // 3. Return a clean object (no password / confirmationCode)
    const { password, ...safeUser } = verifiedUser.toObject();
    return safeUser;
  }

  public async resendVerification(body: resendVerificationDto['body']) {
    if (isEmpty(body.email)) throw new HttpException(400, 'email is empty');

    const user = await this.users.findOne({ email: body.email });
    if (!user) throw new HttpException(401, 'User does not exist');

    user.confirmationCode = this.createToken(user).token;
    await user.save();

    this.emailService
      .sendEmail({
        to: user.email,
        subject: 'Verify email address',
        body: `Click on confirmation link: ${NODE_ENV === 'development' ? ORIGIN : CLIENT_URL}/auth/verify-email/verify/${user.confirmationCode}`,
      })
      .then((res) => {
        return { ...user, password: undefined, confirmationCode: undefined };
      })
      .catch((err) => {
        throw new HttpException(400, 'Error resending verification mail');
      });
  }

  public async login(
    userData: loginDto['body']
  ): Promise<{ cookie: string; user: IUser; token: string }> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: IUser = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(401, `Email does not exist`);

    const isPasswordMatching: boolean = await compare(
      userData.password,
      findUser.password
    );
    if (!isPasswordMatching)
      throw new HttpException(401, 'Password is incorrect');

    if (!findUser.isVerified) {
      findUser.confirmationCode = this.createToken(findUser).token;
      const user = await findUser.save();

      this.emailService
        .sendEmail({
          to: user.email,
          subject: 'Verify email address',
          body: `Click on confirmation link: ${NODE_ENV === 'development' ? ORIGIN : CLIENT_URL}/auth/verify-email/verify/${user.confirmationCode}`,
        })
        .catch((err) => {
          throw new HttpException(400, 'Error resending verification mail');
        });

      throw new HttpException(
        402,
        'Email is not verified, check mail for verification',
        { ...user, password: undefined }
      );
    }

    const user = await this.users
      .findById(findUser._id)
      .populate({
        path: 'profile',
        model: findUser.userType,
      })
      .exec();

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);
    
    if (user.userType === UserType.OFFTAKER) await user.populate('profile.companyAddress');
    
    return { cookie, user, token: tokenData.token };
  }

  public async updatePassword(
    userData: IUser,
    body: updatePasswordDto['body']
  ) {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: IUser = await this.users.findById(userData._id);
    if (!findUser) throw new HttpException(409, `This user does not exist`);

    const isOldPasswordMatching: boolean = await compare(
      body.oldPassword,
      findUser.password
    );
    if (!isOldPasswordMatching)
      throw new HttpException(401, 'Old password is incorrect');

    if (body.newPassword !== body.confirmNewPassword)
      throw new HttpException(
        400,
        'New password and confirm new password do not match'
      );

    const hashedNewPassword = await hash(body.newPassword, 10);
    findUser.password = hashedNewPassword;
    const updatedUser: IUser = await findUser.save();
    if (!updatedUser) throw new HttpException(400, 'Error updating password');

    return updatedUser;
  }

  public async logout(userData: IUser): Promise<IUser> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: IUser = await this.users.findOne({
      email: userData.email,
      password: userData.password,
    });
    if (!findUser)
      throw new HttpException(
        409,
        `This email ${userData.email} was not found`
      );

    return findUser;
  }

  public createToken(user: IUser): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 7 * 24 * 60 * 60;

    return {
      expiresIn,
      token: sign(dataStoredInToken, secretKey, { expiresIn }),
    };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
