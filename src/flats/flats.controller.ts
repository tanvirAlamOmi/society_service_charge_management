// src/flats/flats.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FlatsService } from './flats.service';
import { CreateFlatDto } from './dto/create-flat.dto';
import { UpdateFlatDto } from './dto/update-flat.dto';
import { FlatEntity } from './entities/flat.entity';
import { BulkCreateFlatsDto } from './dto/create-bulk-flat.dto';

@Controller('flats')
export class FlatsController {
  constructor(private readonly flatsService: FlatsService) {}

  @Post()
  create(@Body() createFlatDto: CreateFlatDto): Promise<FlatEntity> {
    return this.flatsService.create(createFlatDto);
  }

  @Post('bulk')
  async createBulkFlats(@Body() bulkCreateFlatsDto: BulkCreateFlatsDto) {
    return this.flatsService.createBulkFlats(bulkCreateFlatsDto);
  }

  @Get()
  findAll(): Promise<FlatEntity[]> {
    return this.flatsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<FlatEntity> {
    return this.flatsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFlatDto: UpdateFlatDto,
  ): Promise<FlatEntity> {
    return this.flatsService.update(id, updateFlatDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<FlatEntity> {
    return this.flatsService.remove(id);
  }
}