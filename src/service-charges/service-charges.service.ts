// src/service-charges/service-charges.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBulkServiceChargeDto, CreateServiceChargeDto } from './dto/create-service-charge.dto';
import { UpdateServiceChargeDto } from './dto/update-service-charge.dto';
import { ServiceChargeEntity } from './entities/service-charge.entity';
import { Prisma } from '@prisma/client';

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

  async createBulk(createServiceChargeDto: CreateBulkServiceChargeDto): Promise<ServiceChargeEntity[]> {
    const { society_id, service_charges } = createServiceChargeDto;

    const society = await this.prisma.society.findUnique({ where: { id: society_id } });
    if (!society) {
      throw new NotFoundException(`Society with ID ${society_id} not found`);
    }

    const serviceChargeData: Prisma.ServiceChargeCreateManyInput[] = [];
    for (const serviceCharge of service_charges) {
      const { predefined_service_charge_id, amounts } = serviceCharge;

      const predefinedServiceCharge = await this.prisma.predefinedServiceCharge.findUnique({
        where: { id: predefined_service_charge_id },
      });
      if (!predefinedServiceCharge) {
        throw new NotFoundException(`Predefined Service Charge with ID ${predefined_service_charge_id} not found`);
      }

      for (const amountEntry of amounts) {
        serviceChargeData.push({
          society_id,
          predefined_service_charge_id,
          flat_type: amountEntry.flat_type,
          amount: amountEntry.amount,
          created_at: new Date(),
        });
      }
    }

    await this.prisma.serviceCharge.createMany({
      data: serviceChargeData,
    });

    return this.prisma.serviceCharge.findMany({
      where: {
        society_id,
        predefined_service_charge_id: { in: service_charges.map(sc => sc.predefined_service_charge_id) },
      },
    });
  }

  async findBySociety(societyId: number): Promise<any> {
    // Validate society exists
    const society = await this.prisma.society.findUnique({ where: { id: societyId } });
    if (!society) {
      throw new NotFoundException(`Society with ID ${societyId} not found`);
    }

    // Fetch all service charges for the society, including the related PredefinedServiceCharge
    const serviceCharges = await this.prisma.serviceCharge.findMany({
      where: { society_id: societyId },
      include: {
        predefined_service_charge: true, // Include the related PredefinedServiceCharge to get the name
      },
    });

    // Group service charges by predefined_service_charge_id
    const groupedCharges: { [key: number]: any } = {};

    for (const charge of serviceCharges) {
      const { predefined_service_charge_id, predefined_service_charge, flat_type, amount } = charge;

      if (!groupedCharges[predefined_service_charge_id]) {
        groupedCharges[predefined_service_charge_id] = {
          predefined_service_charge_id,
          service_type: predefined_service_charge.name,
          amounts: [],
        };
      }

      groupedCharges[predefined_service_charge_id].amounts.push({
        flat_type,
        amount: amount.toNumber(), // Convert Decimal to number for the frontend
      });
    }

    // Convert grouped object to array
    const serviceChargeGroups = Object.values(groupedCharges);

    return {
      society_id: societyId,
      service_charges: serviceChargeGroups,
    };
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