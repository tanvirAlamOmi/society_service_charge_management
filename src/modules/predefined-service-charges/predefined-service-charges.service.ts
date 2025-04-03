import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePredefinedServiceChargeDto } from './dto/create-predefined-service-charge.dto';
import { UpdatePredefinedServiceChargeDto } from './dto/update-predefined-service-charge.dto';
import { PredefinedServiceChargeEntity } from './entities/predefined-service-charge.entity';

@Injectable()
export class PredefinedServiceChargesService {
  constructor(private prisma: PrismaService) {}

  async create(createPredefinedServiceChargeDto: CreatePredefinedServiceChargeDto): Promise<PredefinedServiceChargeEntity> {
    return this.prisma.predefinedServiceCharge.create({
      data: {
        ...createPredefinedServiceChargeDto,
        created_at: new Date(),
      },
    });
  }

  async findAll(): Promise<PredefinedServiceChargeEntity[]> {
    return this.prisma.predefinedServiceCharge.findMany();
  }

  async findOne(id: number): Promise<PredefinedServiceChargeEntity> {
    const predefinedServiceCharge = await this.prisma.predefinedServiceCharge.findUnique({
      where: { id },
    });
    if (!predefinedServiceCharge) {
      throw new NotFoundException(`Predefined Service Charge with ID ${id} not found`);
    }
    return predefinedServiceCharge;
  }

  async update(id: number, updatePredefinedServiceChargeDto: UpdatePredefinedServiceChargeDto): Promise<PredefinedServiceChargeEntity> {
    const predefinedServiceCharge = await this.prisma.predefinedServiceCharge.findUnique({ where: { id } });
    if (!predefinedServiceCharge) {
      throw new NotFoundException(`Predefined Service Charge with ID ${id} not found`);
    }
    return this.prisma.predefinedServiceCharge.update({
      where: { id },
      data: updatePredefinedServiceChargeDto,
    });
  }

  async remove(id: number): Promise<PredefinedServiceChargeEntity> {
    const predefinedServiceCharge = await this.prisma.predefinedServiceCharge.findUnique({ where: { id } });
    if (!predefinedServiceCharge) {
      throw new NotFoundException(`Predefined Service Charge with ID ${id} not found`);
    }
    return this.prisma.predefinedServiceCharge.delete({
      where: { id },
    });
  }
}