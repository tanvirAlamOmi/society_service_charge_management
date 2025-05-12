import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BulkInviteUsersDto, CreateUserDto } from './dto/create-user.dto';  
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserStatus, Invitation, InvitationStatus } from '@prisma/client';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { AuthService } from '../auth/auth.service'; 
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { userSelect } from '../prisma/selects/user.select';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService, 
    private mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    if (createUserDto.email) {
      const existingEmail = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
      if (existingEmail) {
        throw new BadRequestException('A user with this email already exists');
      }
    }
    if (createUserDto.username) {
      const existingUsername = await this.prisma.user.findFirst({ where: { username: createUserDto.username } });
      if (existingUsername) {
        throw new BadRequestException('A user with this username already exists');
      }
    }
    if (createUserDto.phone) {
      const existingPhone = await this.prisma.user.findUnique({ where: { phone: createUserDto.phone } });
      if (existingPhone) {
        throw new BadRequestException('A user with this phone number already exists');
      }
    }
 
    if (createUserDto.role_id) {
      const roleExists = await this.prisma.role.findUnique({  where: { id: createUserDto.role_id } });
      if (!roleExists) {
        throw new BadRequestException(`Role with ID ${createUserDto.role_id} does not exist`);
      }
    }

    if (createUserDto.society_id) {
      const societyExists = await this.prisma.society.findUnique({ where: { id: createUserDto.society_id } });
      if (!societyExists) {
        throw new BadRequestException(`Society with ID ${createUserDto.society_id} does not exist`);
      }
    }

    let hashedPassword: string | undefined;
    if (createUserDto.password) {
      hashedPassword = await this.authService.hashPassword(createUserDto.password);
    }
    
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
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

  // async inviteUsersBulk(
  //   inviteUsersDto: BulkInviteUsersDto,
  //   sender? ,
  //  ): Promise<{
  //   successful: { email: string; invitationId: number }[];
  //   failed: { email: string; error: string }[];
  // }> {
  //   const { users } = inviteUsersDto;  
 
  //   // Check for duplicate emails in the input list
  //   const emailSet = new Set<string>();
  //   const duplicates: string[] = [];
  //   users.forEach(user => {
  //     if (emailSet.has(user.email)) {
  //       duplicates.push(user.email);
  //     } else {
  //       emailSet.add(user.email);
  //     }
  //   });

  //   if (duplicates.length > 0) {
  //     throw new BadRequestException(`Duplicate emails found in the input: ${duplicates.join(', ')}`);
  //   }

  //   // Validate role_id, society_id, and flat_id for each user
  //   const failed: { email: string; error: string }[] = [];
  //   const validUsers: CreateUserDto[] = [];

  //   for (const user of users) {
  //     const { role_id, society_id, flat_id } = user;

  //     // Validate role
  //     const role = await this.prisma.role.findUnique({ where: { id: role_id } });
  //     if (!role) {
  //       failed.push({ email: user.email, error: `Role with ID ${role_id} not found` });
  //       continue;
  //     }

  //     // Validate society
  //     const society = await this.prisma.society.findUnique({ where: { id: society_id } });
  //     if (!society) {
  //       failed.push({ email: user.email, error: `Society with ID ${society_id} not found` });
  //       continue;
  //     } 

  //     // Validate flat (if provided)
  //     if (flat_id) {
  //       const flat = await this.prisma.flat.findUnique({ where: { id: flat_id } });
  //       if (!flat) {
  //         failed.push({ email: user.email, error: `Flat with ID ${flat_id} not found` });
  //         continue;
  //       }
  //     }

  //     validUsers.push(user);
  //   }

  //   // Filter out users that failed validation
  //   const usersToInvite = validUsers.filter(user => !failed.some(f => f.email === user.email));

  //   // Check for existing users
  //   const existingUsers = await this.prisma.user.findMany({
  //     where: {
  //       email: { in: usersToInvite.map(user => user.email) },
  //     },
  //   });

  //   const existingEmailMap = new Map(existingUsers.map(user => [user.email, user]));

  //   // Create invitations for all users (existing or new)
  //   const invitations: Invitation[] = await this.prisma.$transaction(async (tx) => {
      
  //     const createdInvitations: Invitation[] = [];
  
  //     for (const user of usersToInvite) { 
  //       const expiresAt = new Date();
  //       expiresAt.setDate(expiresAt.getDate() + 30); // Invitation expires in 30 days
  
  //       // If the user doesn't exist, create them
  //       let userRecord = existingEmailMap.get(user.email);
  //       if (!userRecord) {
  //         userRecord = await tx.user.create({
  //           data: {
  //             fullname: user.fullname,
  //             email: user.email,
  //             role_id: user.role_id,
  //             society_id: user.society_id,
  //             flat_id: user.flat_id || null,
  //             status: UserStatus.PENDING,
  //             created_at: new Date(),
  //           },
  //         });
  //       }
  
  //       // Create an invitation
  //       const token = randomBytes(32).toString('hex');
  //       const invitation = await tx.invitation.create({
  //         data: {
  //           email: user.email,
  //           token,
  //           status: InvitationStatus.PENDING,
  //           society_id: user.society_id,
  //           inviter_id: sender?.id || null,
  //           user_id: userRecord.id,
  //           createdAt: new Date(),
  //           expiresAt,
  //         },
  //       });
  
  //       createdInvitations.push(invitation);
  //     }
  
  //     return createdInvitations;
  //   });
  
  //   return {
  //     successful: invitations.map(inv => ({ id:inv.user_id, email: inv.email, invitationId: inv.id })),
  //     failed,
  //   };
  // }

  async inviteUsersBulk(
    inviteUsersDto: BulkInviteUsersDto,
    sender?: any,  
  ): Promise<{
    successful: { id: number|null; email: string; invitationId: number }[];
    failed: { email: string; error: string }[];
  }> {
    const { society_id, users } = inviteUsersDto;
  
    // Validate society
    const society = await this.prisma.society.findUnique({ where: { id: society_id } });
    if (!society) {
      throw new BadRequestException(`Society with ID ${society_id} not found`);
    }
  
    // Check for duplicate emails in the input list
    const emailSet = new Set<string>();
    const duplicates: string[] = [];
    users.forEach(user => {
      if (emailSet.has(user.email)) {
        duplicates.push(user.email);
      } else {
        emailSet.add(user.email);
      }
    });
  
    if (duplicates.length > 0) {
      throw new BadRequestException(`Duplicate emails found in the input: ${duplicates.join(', ')}`);
    }
  
    // Validate role_id and flat_id for each user
    const failed: { email: string; error: string }[] = [];
    const validUsers: CreateUserDto[] = [];
  
    for (const user of users) {
      const { role_id, flat_id } = user;
  
      // Validate role
      const role = await this.prisma.role.findUnique({ where: { id: role_id } });
      if (!role) {
        failed.push({ email: user.email, error: `Role with ID ${role_id} not found` });
        continue;
      }
  
      // Validate flat (if provided)
      if (flat_id) {
        const flat = await this.prisma.flat.findUnique({ where: { id: flat_id } });
        if (!flat) {
          failed.push({ email: user.email, error: `Flat with ID ${flat_id} not found` });
          continue;
        }
        // Optionally verify flat belongs to the society
        if (flat.society_id !== society_id) {
          failed.push({ email: user.email, error: `Flat with ID ${flat_id} does not belong to society ${society_id}` });
          continue;
        }
      }
  
      validUsers.push({ ...user, society_id }); // Add society_id to valid user for processing
    }
  
    // Filter out users that failed validation
    const usersToInvite = validUsers.filter(user => !failed.some(f => f.email === user.email));
  
    // Check for existing users
    const existingUsers = await this.prisma.user.findMany({
      where: {
        email: { in: usersToInvite.map(user => user.email) },
      },
    });
  
    const existingEmailMap = new Map(existingUsers.map(user => [user.email, user]));
  
    // Create invitations for all users (existing or new)
    const invitations: Invitation[] = await this.prisma.$transaction(async (tx) => {
      const createdInvitations: Invitation[] = [];
  
      for (const user of usersToInvite) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Invitation expires in 30 days
  
        // If the user doesn't exist, create them
        let userRecord = existingEmailMap.get(user.email);
        if (!userRecord) {
          userRecord = await tx.user.create({
            data: {
              fullname: user.fullname,
              email: user.email,
              role_id: user.role_id,
              society_id, 
              flat_id: user.flat_id || null,
              status: UserStatus.PENDING,
              created_at: new Date(),
            },
          });
        }
  
        // Create an invitation
        const token = randomBytes(32).toString('hex');
        const invitation = await tx.invitation.create({
          data: {
            email: user.email,
            token,
            status: InvitationStatus.PENDING,
            society_id,  
            inviter_id: sender?.id || null,
            user_id: userRecord.id,
            createdAt: new Date(),
            expiresAt,
          },
        });
  
        createdInvitations.push(invitation);
      }
  
      return createdInvitations;
    });

    for (const invitation of invitations) {
      try {
        await this.mailService.sendInvitationEmail(
          invitation.email,
          usersToInvite.find((u) => u.email === invitation.email)!.fullname,
          invitation.token,
        );
      } catch (error) {
        failed.push({
          email: invitation.email,
          error: `Failed to send invitation email: ${error.message}`,
        });
      }
    }
  
    return {
      successful: invitations.map(inv => ({ id: inv.user_id, email: inv.email, invitationId: inv.id })),
      failed,
    };
  }

  async acceptInvitation(
    token: string,
    acceptInvitationDto: AcceptInvitationDto
  ): Promise<UserEntity> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: { user: { select: userSelect }, society: true, flat: true },
    });
  
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
  
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(`Invitation is already ${invitation.status}`);
    }
  
    const now = new Date();
    if (now > invitation.expiresAt) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('Invitation has expired');
    }
  
    const user = invitation.user;
    if (!user) {
      throw new NotFoundException(`User linked to the invitation not found`);
    }
  
    if (acceptInvitationDto.username) {
      const existingUsername = await this.prisma.user.findFirst({
        where: { username: acceptInvitationDto.username },
      });
  
      if (existingUsername && existingUsername.id !== user.id) {
        throw new BadRequestException('A user with this username already exists');
      }
    }
  
    const hashedPassword = await this.authService.hashPassword(acceptInvitationDto.password);
  
    return this.prisma.$transaction(async (prisma) => {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: now,
        },
      });
  
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          username: acceptInvitationDto.username,
          password: hashedPassword,
          alias: acceptInvitationDto.alias,
          phone: acceptInvitationDto.phone,
          service_type: acceptInvitationDto.service_type,
          status: UserStatus.ACTIVE,
          society_id: invitation.society_id,
        },
      });
  
      if (invitation.flat_id) {
        if (updatedUser.role_id === 2) { // Owner
          await prisma.flat.update({
            where: { id: invitation.flat_id },
            data: { owner_id: user.id },
          });
        } else if (updatedUser.role_id === 3) { // Resident
          await prisma.flatResident.updateMany({
            where: {
              flat_id: invitation.flat_id,
              end_date: null,
            },
            data: { end_date: now },
          });
  
          await prisma.flatResident.create({
            data: {
              flat_id: invitation.flat_id,
              resident_id: user.id,
              start_date: now,
            },
          });
        }
      }
  
      return updatedUser;
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

  // async findUsersBySociety(societyId: number): Promise<UserEntity[]> {
  //   const society = await this.prisma.society.findUnique({ where: { id: societyId } });
  //   if (!society) {
  //     throw new NotFoundException(`Society with ID ${societyId} not found`);
  //   }

  //   return this.prisma.user.findMany({
  //     where: {
  //       society_id: societyId,
  //     },
  //     include: {
  //       role: true,
  //       society: true,
  //     },
  //   });
  // }

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

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingEmail) {
        throw new BadRequestException('A user with this email already exists');
      }
    }
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.prisma.user.findFirst({
        where: { username: updateUserDto.username },
      });
      if (existingUsername) {
        throw new BadRequestException('A user with this username already exists');
      }
    }
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: updateUserDto.phone },
      });
      if (existingPhone) {
        throw new BadRequestException('A user with this phone number already exists');
      }
    }

    let hashedPassword: string | undefined;
    if (updateUserDto.password) {
      hashedPassword = await this.authService.hashPassword(updateUserDto.password);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        password: hashedPassword ?? user.password,
      },
    });
  }

  async remove(id: number): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.prisma.user.delete({ where: { id } });
  }

  async findUsersBySociety(societyId: number): Promise<{
    owners: UserEntity[];
    residents: UserEntity[];
  }> {
    // Validate the society
    const society = await this.prisma.society.findUnique({ where: { id: societyId } });
    if (!society) {
      throw new NotFoundException(`Society with ID ${societyId} not found`);
    }

    // Fetch owners (role_id 1 or 2, linked to flats via owner_id)
    const owners = await this.prisma.user.findMany({
      where: {
        society_id: societyId,
        role_id: { in: [1, 2] },
        status: { not: 'CANCELLED' }, 
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        society: {
          select: {
            id: true,
            name: true,
          },
        },
        owned_flats: {
          select: {
            id: true,
            number: true,
            flat_type: true,
          },
        },
      },
    });

    // Fetch residents (role_id 3, linked to flats via FlatResident)
    const residents = await this.prisma.user.findMany({
      where: {
        society_id: societyId,
        role_id: 3,
        status: { not: 'CANCELLED' },
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        society: {
          select: {
            id: true,
            name: true,
          },
        },
        rented_flats: {
          select: {
            flat: {
              select: {
                id: true,
                number: true,
                flat_type: true,
              },
            },
            start_date: true,
            end_date: true,
          },
        },
      },
    });

    return {
      owners,
      residents,
    };
  }

  async checkAvailability(email: string, phone: string): Promise<{ email: boolean; phone: boolean }> {
    if (!email || !phone) {
      throw new BadRequestException('Email and phone are required');
    }
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    const existingPhone = await this.prisma.user.findFirst({
      where: { phone },
    });

    return {
      email: !existingEmail,
      phone: !existingPhone,
    };
  }
  
}