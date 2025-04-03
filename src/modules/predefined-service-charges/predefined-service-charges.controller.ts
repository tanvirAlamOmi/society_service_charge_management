// src/predefined-service-charges/predefined-service-charges.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PredefinedServiceChargesService } from './predefined-service-charges.service';
import { CreatePredefinedServiceChargeDto } from './dto/create-predefined-service-charge.dto';
import { UpdatePredefinedServiceChargeDto } from './dto/update-predefined-service-charge.dto';
import { PredefinedServiceChargeEntity } from './entities/predefined-service-charge.entity';

@Controller('predefined-service-charges')
export class PredefinedServiceChargesController {
  constructor(private readonly predefinedServiceChargesService: PredefinedServiceChargesService) {}

  @Post()
  create(@Body() createPredefinedServiceChargeDto: CreatePredefinedServiceChargeDto): Promise<PredefinedServiceChargeEntity> {
    return this.predefinedServiceChargesService.create(createPredefinedServiceChargeDto);
  }

  @Get()
  findAll(): Promise<PredefinedServiceChargeEntity[]> {
    return this.predefinedServiceChargesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PredefinedServiceChargeEntity> {
    return this.predefinedServiceChargesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePredefinedServiceChargeDto: UpdatePredefinedServiceChargeDto,
  ): Promise<PredefinedServiceChargeEntity> {
    return this.predefinedServiceChargesService.update(id, updatePredefinedServiceChargeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<PredefinedServiceChargeEntity> {
    return this.predefinedServiceChargesService.remove(id);
  }
}