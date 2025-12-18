import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import mongoose, { connect, set, disconnect } from 'mongoose';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import {
  NODE_ENV,
  PORT,
  MONGODB_URL,
  LOG_FORMAT,
  ORIGIN,
  CREDENTIALS,
} from '@config';
import { logger, stream } from '@/utils/logger';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';


class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 4000;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    // this.app.use('/assets', express.static('src/assets'));
    this.app.listen(this.port, () => {});
    logger.info(`=================================`);
    logger.info(`======= ENV: ${this.env} =======`);
    logger.info(`🚀 App listening on the port ${this.port}`);
    logger.info(`=================================`);
  }

  public async closeDatabaseConnection(): Promise<void> {
    try {
      await disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }

  public getServer() {
    return this.app;
  }

  private async connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }
    try {
       await connect(MONGODB_URL);
       console.log('Connected to MongoDB Successfully');
    } catch (error) {
      console.error('Initial MongoDB connection failed.');

      // 1. Check the Error Name for driver-specific network issues
      if (error.name === 'MongoNetworkError') {
        logger.error(
          'Connection failed due to a network issue:',error
        );
      } else if (error.name === 'MongooseServerSelectionError') {
        logger.error(
          'Connection timed out or no available server found:',error
        );
      }

      // 2. Check the Error Code for low-level system failures
      else if (error.code === 'ECONNREFUSED') {
        logger.error(
          'Connection refused by the host: (check if the MongoDB service is running)',error
        );
      }

      // 3. Handle Mongoose-related errors (less common for initial connection)
      else if (error instanceof mongoose.Error) {
        logger.error('Caught a generic Mongoose error:',error);
      }

      // Catch all other unexpected errors
      else {
        logger.error('An unexpected error occurred:',error);
      }
    }

  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({
      origin: ORIGIN,
      methods: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
      credentials: CREDENTIALS,
      allowedHeaders: ['Content-type, Authorization']
    }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use(`${process.env.NODE_ENV === 'production'?'api/v1':'/'}`, route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'Excite Trade REST API',
          version: '1.0.0',
          description: 'Example docs',
          contact: {
            name: 'Oluwayelu Ifeoluwa',
            email: 'ife.oluwayelu@exciteafrica.com',
          },
        },
        servers: [
          {
            url: 'http://localhost:4000/api/v1',
            description: 'Local server',
          },
          {
            url: 'https://excite-trade-api-production.up.railway.app/api/v1',
            description: 'Live server',
          },
        ],
      },
      // apis: ['swagger.yaml'],
      apis: ['./src/routes/**/*.ts'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
