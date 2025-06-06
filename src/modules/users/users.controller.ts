import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Request, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { BulkInviteUsersDto, CreateUserDto } from './dto/create-user.dto'; 
import { UpdateUserDto } from './dto/update-user.dto'; 
import { UserEntity } from './entities/user.entity';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { Public } from 'src/modules/auth/decorators/public.decorator';
 

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post() 
  create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.usersService.create(createUserDto);
  }

  @Public()
  @Post('invite') 
  inviteUser(@Body() inviteUserDto: CreateUserDto): Promise<UserEntity> {
    return this.usersService.inviteUser(inviteUserDto);
  }
 
  @Public()
  @Post('invite/bulk')
   async inviteUsersBulk(@Body() bulkInviteUsersDto: BulkInviteUsersDto, @Request() req ) {
    return this.usersService.inviteUsersBulk(bulkInviteUsersDto, req.user );
  }

  @Public() 
  @Post('token/:token/accept')
async acceptInvitation(
  @Param('token') token: string,
  @Body() acceptInvitationDto: AcceptInvitationDto
) {
  return this.usersService.acceptInvitation(token, acceptInvitationDto);
}

  @Post(':id/cancel') 
  cancelInvitation(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.usersService.cancelInvitation(id);
  }

  @Post(':id/deactivate') 
  markUserInactive(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.usersService.markUserInactive(id);
  }

  // @Get('society/:societyId/invited') 
  // findUsersBySociety(@Param('societyId', ParseIntPipe) societyId: number): Promise<UserEntity[]> {
  //   return this.usersService.findUsersBySociety(societyId);
  // }

   @Get() 
  findAll(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  @Get('profile') 
  async getProfile(@Request() req) { 
    return this.usersService.findOne(req.user.id);
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

  @Get('society/:societyId')
  async findUsersBySocietyRoles(
    @Param('societyId', ParseIntPipe) societyId: number,
  ): Promise<{
    owners: UserEntity[];
    residents: UserEntity[];
  }> {
    return this.usersService.findUsersBySociety(societyId);
  }

  @Post('check-availability')
  async checkAvailability(
    @Body('email') email: string,
    @Body('phone') phone: string,
  ) {  
    return await this.usersService.checkAvailability(email, phone); 
  }
}