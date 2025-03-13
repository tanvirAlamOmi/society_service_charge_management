// src/flats/flats.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlatDto } from './dto/create-flat.dto';
import { UpdateFlatDto } from './dto/update-flat.dto';
import { FlatEntity } from './entities/flat.entity';

@Injectable()
export class FlatsService {
  constructor(private prisma: PrismaService) {}

  async create(createFlatDto: CreateFlatDto): Promise<FlatEntity> {
    const society = await this.prisma.society.findUnique({ where: { id: createFlatDto.society_id } });
    if (!society) {
      throw new BadRequestException(`Society with ID ${createFlatDto.society_id} not found`);
    }
    const owner = await this.prisma.user.findUnique({ where: { id: createFlatDto.owner_id } });
    if (!owner) {
      throw new BadRequestException(`User with ID ${createFlatDto.owner_id} not found`);
    }
    return this.prisma.flat.create({
      data: {
        ...createFlatDto,
        created_at: new Date(),
      },
    });
  }

  async findAll(): Promise<FlatEntity[]> {
    return this.prisma.flat.findMany();
  }

  async findOne(id: number): Promise<FlatEntity> {
    const flat = await this.prisma.flat.findUnique({
      where: { id },
      include: { society: true, owner: true, renters: true, user: true },
    });
    if (!flat) {
      throw new NotFoundException(`Flat with ID ${id} not found`);
    }
    return flat;
  }

  async update(id: number, updateFlatDto: UpdateFlatDto): Promise<FlatEntity> {
    const flat = await this.prisma.flat.findUnique({ where: { id } });
    if (!flat) {
      throw new NotFoundException(`Flat with ID ${id} not found`);
    }
    return this.prisma.flat.update({
      where: { id },
      data: updateFlatDto,
    });
  }

  async remove(id: number): Promise<FlatEntity> {
    const flat = await this.prisma.flat.findUnique({ where: { id } });
    if (!flat) {
      throw new NotFoundException(`Flat with ID ${id} not found`);
    }
    return this.prisma.flat.delete({
      where: { id },
    });
  }
}