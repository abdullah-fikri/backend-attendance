import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request } from 'express';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { GenerateExcel } from 'src/config/excel/main';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly excelService: GenerateExcel,) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('ADMIN')
  @ResponseMessage('Success Get Data users')
  async findAll(@Query() query: GetUsersDto, @Req() req: Request) {
    return this.usersService.findAll(query, req.originalUrl);
  }


  @Get('export')
  @Roles('ADMIN')
  async generatedExcelUsers(@Res() res: Response){
    const workbook = await this.usersService.exportUsers()
    await this.excelService.WriteToResponse(workbook, res, 'data-user.xlsx');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
