// src/service-charges/service-charges.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ServiceChargesService } from './service-charges.service';
import { CreateServiceChargeDto } from './dto/create-service-charge.dto';
import { UpdateServiceChargeDto } from './dto/update-service-charge.dto';
import { ServiceChargeEntity } from './entities/service-charge.entity';

@Controller('service-charges')
export class ServiceChargesController {
  constructor(private readonly serviceChargesService: ServiceChargesService) {}

  @Post()
  create(@Body() createServiceChargeDto: CreateServiceChargeDto): Promise<ServiceChargeEntity> {
    return this.serviceChargesService.create(createServiceChargeDto);
  }

  @Get()
  findAll(): Promise<ServiceChargeEntity[]> {
    return this.serviceChargesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ServiceChargeEntity> {
    return this.serviceChargesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceChargeDto: UpdateServiceChargeDto,
  ): Promise<ServiceChargeEntity> {
    return this.serviceChargesService.update(id, updateServiceChargeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<ServiceChargeEntity> {
    return this.serviceChargesService.remove(id);
  }
}