import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { BuildingInfoDto, ApplyPromoDto } from './dto/create-pricing.dto';
import { Public } from '../auth/decorators/public.decorator';
 
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  // @Post()
  // create(@Body() createPricingDto: CreatePricingDto) {
  //   return this.pricingService.create(createPricingDto);
  // }

  // @Get()
  // findAll() {
  //   return this.pricingService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.pricingService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePricingDto: UpdatePricingDto) {
  //   return this.pricingService.update(+id, updatePricingDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.pricingService.remove(+id);
  // }

  
    @Public()
    @Post('calculate-price')
    async calculatePrice(@Body() buildingInfo: BuildingInfoDto) {
      return this.pricingService.calculateRegistrationPrice(buildingInfo);
    }
   
    @Public()
    @Post('apply-promo')
    async applyPromo(@Body() applyPromoDto: ApplyPromoDto) {
      return this.pricingService.applyPromo(applyPromoDto);
    }
}
