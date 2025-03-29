// src/users/users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto'; 
import { UpdateUserDto } from './dto/update-user.dto'; 
import { UserEntity } from './entities/user.entity';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post() 
  create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.usersService.create(createUserDto);
  }

  @Post('invite') 
  inviteUser(@Body() inviteUserDto: CreateUserDto): Promise<UserEntity> {
    return this.usersService.inviteUser(inviteUserDto);
  }

  @Post(':id/accept') 
  acceptInvitation(
    @Param('id', ParseIntPipe) id: number,
    @Body() acceptInvitationDto: AcceptInvitationDto,
  ): Promise<UserEntity> {
    return this.usersService.acceptInvitation(id, acceptInvitationDto);
  }

  @Post(':id/cancel') 
  cancelInvitation(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.usersService.cancelInvitation(id);
  }

  @Post(':id/deactivate') 
  markUserInactive(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.usersService.markUserInactive(id);
  }

  @Get('society/:societyId/invited') 
  findUsersBySociety(@Param('societyId', ParseIntPipe) societyId: number): Promise<UserEntity[]> {
    return this.usersService.findUsersBySociety(societyId);
  }

  @Get() 
  findAll(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  @Get(':id') 
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.usersService.findOne(id);
  }

  @Patch(':id') 
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id') 
  remove(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.usersService.remove(id);
  }
}