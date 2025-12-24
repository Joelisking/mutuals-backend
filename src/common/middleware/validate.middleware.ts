import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ResponseUtil } from '../utils/response.util';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    ResponseUtil.error(
      res,
      'Validation failed',
      400,
      errors.array()
    );
    return;
  }

  next();
};
