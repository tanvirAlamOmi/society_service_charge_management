import { Controller, Post, Get, Param, Body, ParseIntPipe, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { BillService } from './bill.service';
import { GenerateBillsDto, AssignBillDto, PayBillDto, BillResponseDto, PayBillResponseDto } from './dto/create-bill.dto';

@Controller('bills')
export class BillController {
  constructor(private billService: BillService) {}

  @Post('generate')
  async generateBills(@Body() dto: GenerateBillsDto): Promise<BillResponseDto[]> {
    return this.billService.generateBills(dto);
  }

  @Get('society/:societyId/user/:userId')
  async getUserBills(
    @Param('societyId', ParseIntPipe) societyId: number,
    @Param('userId', ParseIntPipe) userId: number,

  ): Promise<BillResponseDto[]> {
    return this.billService.getUserBills(societyId, userId);
  }

  @Get('society/:societyId')
  async getSocietyBills(
    @Param('societyId', ParseIntPipe) societyId: number
  ): Promise<BillResponseDto[]> {
    return this.billService.getSocietyBills(societyId);
  }

  @Post(':billId/assign')
  async assignBillToResident(
    @Param('billId', ParseIntPipe) billId: number,
    @Body() dto: AssignBillDto,
  ): Promise<BillResponseDto> {
    return this.billService.assignBillToResident(billId, dto);
  }

  // @Post(':billId/pay')
  // async payBill(
  //   @Param('billId', ParseIntPipe) billId: number,
  //   @Body() dto: PayBillDto,
  // ): Promise<PayBillResponseDto> {
  //   return this.billService.payBill(billId, dto);
  // }
}