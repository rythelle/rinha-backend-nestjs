import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import redis from 'src/database/redis';

@Injectable()
export class VerifyCacheMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { t } = req.query;

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
