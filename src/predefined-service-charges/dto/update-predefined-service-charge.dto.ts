import { PartialType } from '@nestjs/mapped-types';
import { CreatePredefinedServiceChargeDto } from './create-predefined-service-charge.dto';

export class UpdatePredefinedServiceChargeDto extends PartialType(CreatePredefinedServiceChargeDto) {}