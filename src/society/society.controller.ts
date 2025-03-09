import { Controller } from '@nestjs/common';
import { SocietyService } from './society.service';

@Controller('society')
export class SocietyController {
  constructor(private readonly societyService: SocietyService) {}
}
