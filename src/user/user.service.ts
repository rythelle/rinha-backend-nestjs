import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user-dto';
import { randomUUID } from 'crypto';
import poolPostgres from 'src/database/pg';

@Injectable()
export class UserService {
  async create(
    @Body()
    { apelido, nascimento, nome, stack }: CreateUserDto,
  ) {
    if (!apelido || !nome || !nascimento) {
      throw new HttpException(
        `${nascimento} is format invalid, only accept AAAA-MM-DD`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(nascimento)) {
      throw new HttpException(
        `${nascimento} is format invalid, only accept AAAA-MM-DD`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const apelidoNormalized = apelido
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const nomeNormalized = nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const stackNormalized =
      Array.isArray(stack) && stack?.length > 0 && stack
        ? stack.map((item) =>
            item
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase(),
          )
        : [];

    const uniqueId = randomUUID();

    const user = {
      id: uniqueId,
      apelido: apelidoNormalized,
      nome: nomeNormalized,
      nascimento,
      stack: stackNormalized,
    };

    try {
      await poolPostgres.query(
        `INSERT INTO PEOPLE (ID, APELIDO, NOME, NASCIMENTO, STACK) VALUES ('${uniqueId}', '${apelido}', '${nome}', '${nascimento}', '{${stack}}')`,
      );
    } catch (error) {
      if (error.code === '22008')
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);

      throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    return user;
  }

  async findUnique(id: string) {
    if (!id) return {};

    const user = await poolPostgres.query(
      `SELECT ID, APELIDO, NOME, NASCIMENTO, STACK FROM PEOPLE WHERE ID = '${id}'`,
    );

    if (user.rows.length <= 0) return {};

    return user.rows[0];
  }

  async findTerm(term: string) {
    if (!term) return [];

    const termNormalized = decodeURIComponent(term)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const result = await poolPostgres.query(
      `SELECT ID, APELIDO, NOME, NASCIMENTO, STACK FROM PEOPLE WHERE SEARCH_TEXT ILIKE '%' || '${termNormalized}' || '%' LIMIT 50`,
    );

    if (!result) return [];

    return result.rows;
  }
}
