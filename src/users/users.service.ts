// src/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';  
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserStatus } from '@prisma/client';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        pay_service_charge: createUserDto.pay_service_charge ?? true,
        created_at: new Date(),
        status: createUserDto.status ?? UserStatus.PENDING,
      },
    });
  }

  async inviteUser(inviteUserDto: CreateUserDto): Promise<UserEntity> {
    const { fullname, email, role_id, society_id, flat_id } = inviteUserDto;

     const role = await this.prisma.role.findUnique({ where: { id: role_id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${role_id} not found`);
    }

    const society = await this.prisma.society.findUnique({ where: { id: society_id } });
    if (!society) {
      throw new NotFoundException(`Society with ID ${society_id} not found`);
    }

    if (flat_id) {
      const flat = await this.prisma.flat.findUnique({ where: { id: flat_id } });
      if (!flat) {
        throw new NotFoundException(`Flat with ID ${flat_id} not found`);
      }
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException(`User with email ${email} already exists`);
    }

    return this.prisma.user.create({
      data: {
        fullname,
        email,
        role_id,
        society_id,
        flat_id: flat_id || null,
        status: UserStatus.PENDING,
        created_at: new Date(),
      },
    });
  }

  async acceptInvitation(userId: number, acceptInvitationDto: AcceptInvitationDto): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.status !== UserStatus.PENDING) {
      throw new BadRequestException(`User is not in PENDING status`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        username: acceptInvitationDto.username,
        password: acceptInvitationDto.password, // In production, hash the password
        alias: acceptInvitationDto.alias,
        service_type: acceptInvitationDto.service_type,
        status: UserStatus.ACTIVE,
      },
    });
  }

  async cancelInvitation(userId: number): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.status !== UserStatus.PENDING) {
      throw new BadRequestException(`User is not in PENDING status`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.CANCELLED,
      },
    });
  }

  async markUserInactive(userId: number): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(`User is not in ACTIVE status`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.INACTIVE,
        flat_id: null, 
      },
    });
  }

  async findUsersBySociety(societyId: number): Promise<UserEntity[]> {
    const society = await this.prisma.society.findUnique({ where: { id: societyId } });
    if (!society) {
      throw new NotFoundException(`Society with ID ${societyId} not found`);
    }

    return this.prisma.user.findMany({
      where: {
        society_id: societyId,
      },
      include: {
        role: true, // Include role details for better context
      },
    });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.prisma.user.delete({ where: { id } });
  }
}