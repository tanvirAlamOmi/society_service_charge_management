import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserServiceChargeDto } from './dto/create-user-service-charge.dto';
import { UpdateUserServiceChargeDto } from './dto/update-user-service-charge.dto';
import { UserServiceChargeEntity } from './entities/user-service-charge.entity';

@Injectable()
export class UserServiceChargesService {
  constructor(private prisma: PrismaService) {}

  async create(createUserServiceChargeDto: CreateUserServiceChargeDto): Promise<UserServiceChargeEntity> {
    const flat = await this.prisma.flat.findUnique({ where: { id: createUserServiceChargeDto.flat_id } });
    if (!flat) {
      throw new BadRequestException(`Flat with ID ${createUserServiceChargeDto.flat_id} not found`);
    }
    const predefinedServiceCharge = await this.prisma.predefinedServiceCharge.findUnique({
      where: { id: createUserServiceChargeDto.predefined_service_charge_id },
    });
    if (!predefinedServiceCharge) {
      throw new BadRequestException(`Predefined Service Charge with ID ${createUserServiceChargeDto.predefined_service_charge_id} not found`);
    }
    return this.prisma.userServiceCharge.create({
      data: {
        ...createUserServiceChargeDto,
        amount: createUserServiceChargeDto.amount,
        created_at: new Date(),
      },
    });
  }

  async findAll(): Promise<UserServiceChargeEntity[]> {
    return this.prisma.userServiceCharge.findMany();
  }

  async findOne(id: number): Promise<UserServiceChargeEntity> {
    const userServiceCharge = await this.prisma.userServiceCharge.findUnique({
      where: { id },
      include: { flat: true, predefined_service_charge: true },
    });
    if (!userServiceCharge) {
      throw new NotFoundException(`User Service Charge with ID ${id} not found`);
    }
    return userServiceCharge;
  }

  async update(id: number, updateUserServiceChargeDto: UpdateUserServiceChargeDto): Promise<UserServiceChargeEntity> {
    const userServiceCharge = await this.prisma.userServiceCharge.findUnique({ where: { id } });
    if (!userServiceCharge) {
      throw new NotFoundException(`User Service Charge with ID ${id} not found`);
    }
    return this.prisma.userServiceCharge.update({
      where: { id },
      data: updateUserServiceChargeDto,
    });
  }

  async remove(id: number): Promise<UserServiceChargeEntity> {
    const userServiceCharge = await this.prisma.userServiceCharge.findUnique({ where: { id } });
    if (!userServiceCharge) {
      throw new NotFoundException(`User Service Charge with ID ${id} not found`);
    }
    return this.prisma.userServiceCharge.delete({
      where: { id },
    });
  }
}