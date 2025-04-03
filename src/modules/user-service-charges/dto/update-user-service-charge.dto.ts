import { PartialType } from '@nestjs/mapped-types';
import { CreateUserServiceChargeDto } from './create-user-service-charge.dto';

export class UpdateUserServiceChargeDto extends PartialType(CreateUserServiceChargeDto) {}