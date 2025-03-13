import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceChargeDto } from './create-service-charge.dto';

export class UpdateServiceChargeDto extends PartialType(CreateServiceChargeDto) {}