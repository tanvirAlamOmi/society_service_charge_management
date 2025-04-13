import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UserServiceChargesService } from './user-service-charges.service';
import { CreateUserServiceChargeDto } from './dto/create-user-service-charge.dto';
import { UpdateUserServiceChargeDto } from './dto/update-user-service-charge.dto';
import { UserServiceChargeEntity } from './entities/user-service-charge.entity';

@Controller('user-service-charges')
export class UserServiceChargesController {
  constructor(private readonly userServiceChargesService: UserServiceChargesService) {}

  @Post()
  create(@Body() createUserServiceChargeDto: CreateUserServiceChargeDto): Promise<UserServiceChargeEntity> {
    return this.userServiceChargesService.create(createUserServiceChargeDto);
  }

  @Get()
  findAll(): Promise<UserServiceChargeEntity[]> {
    return this.userServiceChargesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserServiceChargeEntity> {
    return this.userServiceChargesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserServiceChargeDto: UpdateUserServiceChargeDto,
  ): Promise<UserServiceChargeEntity> {
    return this.userServiceChargesService.update(id, updateUserServiceChargeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<UserServiceChargeEntity> {
    return this.userServiceChargesService.remove(id);
  }
}