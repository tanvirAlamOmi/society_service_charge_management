// src/flats/flats.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlatDto } from './dto/create-flat.dto';
import { UpdateFlatDto } from './dto/update-flat.dto';
import { FlatEntity } from './entities/flat.entity';
import { BulkCreateFlatsDto } from './dto/create-bulk-flat.dto';

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

  async createBulkFlats(
    bulkCreateFlatsDto: BulkCreateFlatsDto,
  ): Promise<{
    successful: FlatEntity[];
    failed: { number: string; error: string }[];
  }> {
   const { society_id, flats } = bulkCreateFlatsDto;

    // Validate the society
    const society = await this.prisma.society.findUnique({ where: { id: society_id } });
    if (!society) {
      throw new BadRequestException(`Society with ID ${society_id} not found`);
    }

    // Map the input flats to CreateFlatDto by adding society_id
    const flatsWithSociety: CreateFlatDto[] = flats.map(flat => ({
      ...flat,
      society_id, // Add the top-level society_id to each flat
    }));

    // Check for duplicate flat numbers in the input
    const flatNumberSet = new Set<string>();
    const duplicates: string[] = [];
    flatsWithSociety.forEach(flat => {
      if (flatNumberSet.has(flat.number)) {
        duplicates.push(flat.number);
      } else {
        flatNumberSet.add(flat.number);
      }
    });

    if (duplicates.length > 0) {
      throw new BadRequestException(`Duplicate flat numbers found in the input: ${duplicates.join(', ')}`);
    }

    // Check for existing flats with the same numbers in the society
    const existingFlats = await this.prisma.flat.findMany({
      where: {
        society_id,
        number: { in: flatsWithSociety.map(flat => flat.number) },
      },
    });

    const existingFlatNumbers = new Set(existingFlats.map(flat => flat.number));
    const failed: { number: string; error: string }[] = [];
    const validFlats: CreateFlatDto[] = [];

    flatsWithSociety.forEach(flat => {
      if (existingFlatNumbers.has(flat.number)) {
        failed.push({ number: flat.number, error: `Flat with number ${flat.number} already exists in society ${society_id}` });
      } else {
        validFlats.push(flat);
      }
    });

    // Validate owners and residents
    const ownerIds = [...new Set(validFlats.map(flat => flat.owner_id))];
    const residentIds = [...new Set(validFlats.map(flat => flat.resident_id).filter(id => id !== undefined))];

    const owners = await this.prisma.user.findMany({ where: { id: { in: ownerIds } } });
    const residents = residentIds.length > 0 ? await this.prisma.user.findMany({ where: { id: { in: residentIds } } }) : [];

    const ownerMap = new Map(owners.map(user => [user.id, user]));
    const residentMap = new Map(residents.map(user => [user.id, user]));

    for (const flat of validFlats) {
      if (!ownerMap.has(flat.owner_id)) {
        failed.push({ number: flat.number, error: `Owner with ID ${flat.owner_id} not found` });
        continue;
      }

      if (flat.resident_id && !residentMap.has(flat.resident_id)) {
        failed.push({ number: flat.number, error: `Resident with ID ${flat.resident_id} not found` });
        continue;
      }
    }

    // Filter out flats that failed validation
    const flatsToCreate = validFlats.filter(flat => !failed.some(f => f.number === flat.number));

    // Create flats in bulk
    const createdFlats = await this.prisma.$transaction(
      flatsToCreate.map(flat =>
        this.prisma.flat.create({
          data: {
            number: flat.number,
            flat_type: flat.flat_type,
            owner_id: flat.owner_id,
            society_id: flat.society_id, 
            created_at: new Date(),
          },
        }),
      ),
    );

    return {
      successful: createdFlats,
      failed,
    };
  } 

  async findAll(): Promise<FlatEntity[]> {
    return this.prisma.flat.findMany();
  }

  async findOne(id: number): Promise<FlatEntity> {
    const flat = await this.prisma.flat.findUnique({
      where: { id },
      include: { society: true, owner: true, 
        residents: {
          include: { resident: true },  
          where: { end_date: null },  
      }, },
    });
    if (!flat) {
      throw new NotFoundException(`Flat with ID ${id} not found`);
    }
    return flat;
  }

  async update(id: number, updateFlatDto: UpdateFlatDto): Promise<FlatEntity> {
    const flat = await this.prisma.flat.findUnique({
      where: { id },
      include: {
        residents: {
          where: { end_date: null },
          take: 1,
          orderBy: { created_at: 'asc' },
        },
      },
    });
    if (!flat) {
      throw new NotFoundException(`Flat with ID ${id} not found`);
    }

    const newResidentId = updateFlatDto.resident_id;
    const currentResident = flat.residents[0];

    const { resident_id, ...flatUpdateData } = updateFlatDto;

    return this.prisma.$transaction(async (prisma) => {
      if (newResidentId !== undefined) {
        if (currentResident) {
          // Check for conflicting end_date
          const conflictingRecord = await prisma.flatResident.findFirst({
            where: {
              flat_id: id,
              resident_id: currentResident.resident_id,
              end_date: { not: null }, // Look for historical records
            },
            orderBy: { end_date: 'desc' }, // Get the most recent
          });

          let newEndDate = new Date();
          if (conflictingRecord && conflictingRecord.end_date) {
            // Compare timestamps only if end_date is not null
            if (conflictingRecord.end_date.getTime() === newEndDate.getTime()) {
              newEndDate = new Date(newEndDate.getTime() + 1);
            }
          }

          await prisma.flatResident.update({
            where: {
              id: currentResident.id,
            },
            data: { end_date: newEndDate },
          });
        }

        if (newResidentId) {
          const newResident = await prisma.user.findUnique({
            where: { id: newResidentId },
          });
          if (!newResident) {
            throw new NotFoundException(`User with ID ${newResidentId} not found`);
          }

          const existingActiveResident = await prisma.flatResident.findFirst({
            where: {
              flat_id: id,
              resident_id: newResidentId,
              end_date: null,
            },
          });

          if (!existingActiveResident) {
            await prisma.flatResident.create({
              data: {
                flat_id: id,
                resident_id: newResidentId,
                start_date: new Date(),
              },
            });
          } else {
            console.log(`Resident ${newResidentId} is already active for flat ${id}`);
          }
        }
      }

      return prisma.flat.update({
        where: { id },
        data: flatUpdateData,
      });
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

 
  async findBySociety(societyId: number): Promise<FlatEntity[]> {
    // Validate the society
    const society = await this.prisma.society.findUnique({ 
      where: { id: societyId } 
    });
    
    if (!society) {
      throw new NotFoundException(`Society with ID ${societyId} not found`);
    }
  
    const flats = await this.prisma.flat.findMany({
      where: { 
        society_id: societyId 
      },
      include: {
        society: {
          select: {
            id: true,
            name: true,
            service_charges: {
              where: {
                flat_type: { in: ['TWO_BHK', 'THREE_BHK', 'FOUR_BHK'] }
              },
              include: {
                predefined_service_charge: {
                  select: {
                    id: true,
                    name: true,
                    description: true
                  }
                }
              }
            }
          }
        },
        owner: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
            status: true
          }
        },
        residents: {
          where: {
            end_date: null // Only include the current resident
          },
          take: 1, // Ensure only one active resident is returned
          include: {
            resident: {
              select: {
                id: true,
                fullname: true,
                email: true,
                phone: true,
                status: true
              }
            }
          }
        },
        user_service_charges: {
          include: {
            predefined_service_charge: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: {
        number: 'asc'
      }
    });
  
    if (!flats.length) {
      throw new NotFoundException(`No flats found for society with ID ${societyId}`);
    }
  
    // Filter service_charges to match each flat's flat_type
    return flats.map(flat => ({
      ...flat,
      society: {
        ...flat.society,
        service_charges: flat.society.service_charges.filter(
          serviceCharge => serviceCharge.flat_type === flat.flat_type
        )
      },
      residents: flat.residents.length > 0 ? flat.residents[0] : null
    }));
  }
}