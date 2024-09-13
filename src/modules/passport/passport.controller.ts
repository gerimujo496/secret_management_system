import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PassportService } from './passport.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdatePassportDto } from './dto/update-passport.dto';

@Controller('passport')
export class PassportController {
  constructor(private readonly passportService: PassportService) {}

  @Post()
  create(@Body() createPassportDto: CreatePassportDto) {
    return this.passportService.create(createPassportDto);
  }

  @Get()
  findAll() {
    return this.passportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.passportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePassportDto: UpdatePassportDto) {
    return this.passportService.update(+id, updatePassportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.passportService.remove(+id);
  }
}
