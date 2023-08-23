import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Response,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../dto/create-user-dto';
import { Response as Res } from 'express';
import redis from 'src/database/redis';
import { ValidationPipe } from 'src/validation/validation.pipe';
import { GetUserDto } from 'src/dto/get-user-dto';

@Controller('pessoas')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
    @Response() res: Res,
  ) {
    const user = await this.userService.create(createUserDto);

    redis.set(user.id, JSON.stringify(user), 'EX', 360);

    return res.set({ Location: `/pessoas/${user.id}` }).json(user);
  }

  @Get(':id')
  async findUnique(@Param('id') id: GetUserDto) {
    return this.userService.findUnique(id);
  }

  @Get()
  async findTerm(@Query('t') term: string) {
    return this.userService.findTerm(term);
  }
}
