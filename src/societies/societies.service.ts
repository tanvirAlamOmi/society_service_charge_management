// src/societies/societies.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocietyDto } from './dto/create-society.dto';
import { UpdateSocietyDto } from './dto/update-society.dto';
import { SocietyEntity } from './entities/society.entity';

@Injectable()
export class SocietiesService {
  constructor(private prisma: PrismaService) {}

  async create(createSocietyDto: CreateSocietyDto): Promise<SocietyEntity> {
    return this.prisma.society.create({
      data: {
        ...createSocietyDto,
        created_at: new Date(),
      },
    });
  }

  async findAll(): Promise<SocietyEntity[]> {
    return this.prisma.society.findMany();
  }

  async findOne(id: number): Promise<SocietyEntity> {
    const society = await this.prisma.society.findUnique({
      where: { id },
      include: { users: true, flats_rel: true, service_charges: true },
    });
    if (!society) {
      throw new NotFoundException(`Society with ID ${id} not found`);
    }
    return society;
  }

  async update(id: number, updateSocietyDto: UpdateSocietyDto): Promise<SocietyEntity> {
    const society = await this.prisma.society.findUnique({ where: { id } });
    if (!society) {
      throw new NotFoundException(`Society with ID ${id} not found`);
    }
    return this.prisma.society.update({
      where: { id },
      data: updateSocietyDto,
    });
  }

  async remove(id: number): Promise<SocietyEntity> {
    const society = await this.prisma.society.findUnique({ where: { id } });
    if (!society) {
      throw new NotFoundException(`Society with ID ${id} not found`);
    }
    return this.prisma.society.delete({
      where: { id },
    });
  }
}