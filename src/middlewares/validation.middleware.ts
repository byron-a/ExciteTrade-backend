import { ZodError, ZodSchema } from 'zod';
import { Response, NextFunction, Request } from 'express';

import { HttpException } from '@exceptions/HttpException';

const ValidationMiddleware = function (schema: ZodSchema) {
  return function (
    req: Request<any, any, any, any>,
    _res: Response,
    next: NextFunction
  ) {
    try {
      const vr = schema.parse({
        params: req.params,
        body: req.body,
        query: req.query,
      });

      req.query = vr.query;
      req.params = vr.params;
      req.body = vr.body;
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const errors = e.errors.map((err) =>
          Object.assign(
            {},
            {
              path: err.path[1],
              message: err.message,
            }
          )
        );

        throw new HttpException(
          400,
          `${errors[0].path || ""} ${errors[0].message.toLocaleLowerCase()}`
        );
      } else {
        next(new HttpException(400, e.message));
      }
    }
  };
};

export default ValidationMiddleware;
