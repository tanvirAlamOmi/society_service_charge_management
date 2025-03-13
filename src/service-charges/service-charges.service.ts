// src/service-charges/service-charges.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceChargeDto } from './dto/create-service-charge.dto';
import { UpdateServiceChargeDto } from './dto/update-service-charge.dto';
import { ServiceChargeEntity } from './entities/service-charge.entity';

@Injectable()
export class ServiceChargesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceChargeDto: CreateServiceChargeDto): Promise<ServiceChargeEntity> {
    const society = await this.prisma.society.findUnique({ where: { id: createServiceChargeDto.society_id } });
    if (!society) {
      throw new BadRequestException(`Society with ID ${createServiceChargeDto.society_id} not found`);
    }
    const predefinedServiceCharge = await this.prisma.predefinedServiceCharge.findUnique({
      where: { id: createServiceChargeDto.predefined_service_charge_id },
    });
    if (!predefinedServiceCharge) {
      throw new BadRequestException(`Predefined Service Charge with ID ${createServiceChargeDto.predefined_service_charge_id} not found`);
    }
    return this.prisma.serviceCharge.create({
      data: {
        ...createServiceChargeDto,
        amount: createServiceChargeDto.amount,
        created_at: new Date(),
      },
    });
  }

  async findAll(): Promise<ServiceChargeEntity[]> {
    return this.prisma.serviceCharge.findMany();
  }

  async findOne(id: number): Promise<ServiceChargeEntity> {
    const serviceCharge = await this.prisma.serviceCharge.findUnique({
      where: { id },
      include: { society: true, predefined_service_charge: true, payments: true },
    });
    if (!serviceCharge) {
      throw new NotFoundException(`Service Charge with ID ${id} not found`);
    }
    return serviceCharge;
  }

  async update(id: number, updateServiceChargeDto: UpdateServiceChargeDto): Promise<ServiceChargeEntity> {
    const serviceCharge = await this.prisma.serviceCharge.findUnique({ where: { id } });
    if (!serviceCharge) {
      throw new NotFoundException(`Service Charge with ID ${id} not found`);
    }
    return this.prisma.serviceCharge.update({
      where: { id },
      data: updateServiceChargeDto,
    });
  }

  async remove(id: number): Promise<ServiceChargeEntity> {
    const serviceCharge = await this.prisma.serviceCharge.findUnique({ where: { id } });
    if (!serviceCharge) {
      throw new NotFoundException(`Service Charge with ID ${id} not found`);
    }
    return this.prisma.serviceCharge.delete({
      where: { id },
    });
  }
}