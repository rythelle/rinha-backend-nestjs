import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import redis from 'src/database/redis';
import { Request, Response, NextFunction } from 'express';

interface IParams {
  t: string;
}

@Injectable()
export class VerifyCacheMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const [, , id] = req.originalUrl.split('/');
    const { t } = JSON.parse(JSON.stringify(req.query)) as IParams;

    if (t) return next();

    redis.get(id, (err, value) => {
      if (err) throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);

      if (value !== null) {
        res.writeHead(200, { 'content-type': 'application/json' });

        res.write(JSON.stringify(JSON.parse(value.toString())));

        return res.end();
      } else {
        return next();
      }
    });
  }
}
