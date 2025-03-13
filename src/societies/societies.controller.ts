// src/societies/societies.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SocietiesService } from './societies.service';
import { CreateSocietyDto } from './dto/create-society.dto';
import { UpdateSocietyDto } from './dto/update-society.dto';
import { SocietyEntity } from './entities/society.entity';

@Controller('societies')
export class SocietiesController {
  constructor(private readonly societiesService: SocietiesService) {}

  @Post()
  create(@Body() createSocietyDto: CreateSocietyDto): Promise<SocietyEntity> {
    return this.societiesService.create(createSocietyDto);
  }

  @Get()
  findAll(): Promise<SocietyEntity[]> {
    return this.societiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SocietyEntity> {
    return this.societiesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSocietyDto: UpdateSocietyDto,
  ): Promise<SocietyEntity> {
    return this.societiesService.update(id, updateSocietyDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<SocietyEntity> {
    return this.societiesService.remove(id);
  }
}