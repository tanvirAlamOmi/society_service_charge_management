import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillStatus, PaymentStatus } from '@prisma/client';
import { GenerateBillsDto, AssignBillDto, PayBillDto, BillResponseDto, PayBillResponseDto } from './dto/create-bill.dto';
import { BillEntity } from './entities/bill.entity';
import { startOfMonth, parseISO, endOfMonth } from 'date-fns';
import { PaymentEntity } from '../payments/entities/payment.entity';
import { FlatEntity } from '../flats/entities/flat.entity';
import { ServiceChargeEntity } from '../service-charges/entities/service-charge.entity';
import { UserServiceChargeEntity } from '../user-service-charges/entities/user-service-charge.entity';
import { PredefinedServiceChargeEntity } from '../predefined-service-charges/entities/predefined-service-charge.entity';

@Injectable()
export class BillService {
  constructor(private prisma: PrismaService) {}

  async generateBills(dto: GenerateBillsDto): Promise<BillResponseDto[]> {
    const billMonth = endOfMonth(parseISO(dto.month));
  
    const existingBills = await this.prisma.bill.findMany({
      where: { society_id: dto.societyId, bill_month: billMonth },
    });
    if (existingBills.length > 0) {
      throw new Error('Bills already generated for this month');
    }
  
    const flats = await this.prisma.flat.findMany({
      where: { society_id: dto.societyId },
      include: {
        residents: {
          where: {
            start_date: { lte: billMonth },
            OR: [{ end_date: null }, { end_date: { gte: billMonth } }],
          },
          include: { resident: true },
        },
        society: true,
        owner: true,
      },
    });
  
    const bills: BillResponseDto[] = [];
    for (const flat of flats) {
      const flatEntity = flat as FlatEntity;
  
      // Determine user to bill (resident if present, else owner)
      const resident = flat.residents[0];
      const userId = resident ? resident.resident_id : flatEntity.owner_id;
  
      const commonCharges = await this.prisma.serviceCharge.findMany({
        where: { society_id: dto.societyId, flat_type: flatEntity.flat_type },
        include: { predefined_service_charge: true },
      }) as (ServiceChargeEntity & { predefined_service_charge: PredefinedServiceChargeEntity })[];
  
      const flatCharges = await this.prisma.userServiceCharge.findMany({
        where: { flat_id: flatEntity.id },
        include: { predefined_service_charge: true },
      }) as (UserServiceChargeEntity & { predefined_service_charge: PredefinedServiceChargeEntity })[];
  
      const commonChargesJson = commonCharges.map((charge) => ({
        name: charge.predefined_service_charge.name,
        amount: charge.amount.toNumber(),
      }));
  
      const flatChargesJson = flatCharges.map((charge) => ({
        name: charge.predefined_service_charge.name,
        amount: charge.amount.toNumber(),
      }));
  
      const totalAmount =
        commonCharges.reduce((sum, charge) => sum + charge.amount.toNumber(), 0) +
        flatCharges.reduce((sum, charge) => sum + charge.amount.toNumber(), 0);
  
      const bill = await this.prisma.bill.create({
        data: {
          user_id: userId,
          flat_id: flatEntity.id,
          society_id: dto.societyId,
          bill_month: billMonth,
          common_charges: commonChargesJson,
          flat_charges: flatChargesJson,
          total_amount: totalAmount,
          status: BillStatus.PENDING,
        },
        include: {
          flat: { select: { number: true, flat_type: true } },
          society: { select: { name: true } },
          payments: true,
        },
      }) as BillEntity & {
        flat: { number: string; flat_type: string };
        society: { name: string };
        payments: PaymentEntity[];
      };
  
      bills.push({
        id: bill.id,
        user_id: bill.user_id,
        flat_id: bill.flat_id,
        society_id: bill.society_id,
        bill_month: bill.bill_month.toISOString(),
        status: bill.status,
        total_amount: bill.total_amount.toNumber(),
        common_charges: bill.common_charges,
        flat_charges: bill.flat_charges,
        flat: bill.flat,
        society: bill.society,
        payments: bill.payments.map((p) => ({
          id: p.id,
          amount: p.amount?.toNumber() ?? 0,
          status: p.status,
          payment_date: p.payment_date.toISOString(),
          tran_id: p.tran_id,
        })),
      });
    }
  
    return bills;
  }
  
  async getUserBills(societyId: number, userId: number): Promise<BillResponseDto[]> {
    const bills = await this.prisma.bill.findMany({
      where: {society_id: societyId, user_id: userId },
      include: {
        flat: { select: { number: true, flat_type: true } },
        society: { select: { name: true } },
        payments: true,
      },
      orderBy: { bill_month: 'desc' },
    }) as (BillEntity & {
      flat: { number: string; flat_type: string };
      society: { name: string };
      payments: PaymentEntity[];
    })[];

    return bills.map((bill) => ({
      id: bill.id,
      user_id: bill.user_id,
      flat_id: bill.flat_id,
      society_id: bill.society_id,
      bill_month: bill.bill_month.toISOString(),
      status: bill.status,
      total_amount: bill.total_amount.toNumber(),
      common_charges: bill.common_charges,
      flat_charges: bill.flat_charges,
      flat: bill.flat,
      society: bill.society,
      payments: bill.payments.map((p) => ({
        id: p.id,
        amount: p.amount?.toNumber() ?? 0,
        status: p.status,
        payment_date: p.payment_date.toISOString(),
        tran_id: p.tran_id,
      })),
    }));
  }

  
  async getSocietyBills(societyId: number): Promise<BillResponseDto[]> {
    const bills = await this.prisma.bill.findMany({
      where: {society_id: societyId},
      include: {
        flat: { select: { number: true, flat_type: true } },
        society: { select: { name: true } },
        payments: true,
      },
      orderBy: { bill_month: 'desc' },
    }) as (BillEntity & {
      flat: { number: string; flat_type: string };
      society: { name: string };
      payments: PaymentEntity[];
    })[];

    return bills.map((bill) => ({
      id: bill.id,
      user_id: bill.user_id,
      flat_id: bill.flat_id,
      society_id: bill.society_id,
      bill_month: bill.bill_month.toISOString(),
      status: bill.status,
      total_amount: bill.total_amount.toNumber(),
      common_charges: bill.common_charges,
      flat_charges: bill.flat_charges,
      flat: bill.flat,
      society: bill.society,
      payments: bill.payments.map((p) => ({
        id: p.id,
        amount: p.amount?.toNumber() ?? 0,
        status: p.status,
        payment_date: p.payment_date.toISOString(),
        tran_id: p.tran_id,
      })),
    }));
  }

  async assignBillToResident(billId: number, dto: AssignBillDto): Promise<BillResponseDto> {
    const bill = await this.prisma.bill.findUnique({
      where: { id: billId },
      include: { flat: { include: { residents: true } } },
    }) as BillEntity & {
      flat: FlatEntity & { residents };
    };

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    // Check if requester is the owner
    if (bill.flat.owner_id !== dto.ownerId) {
      throw new UnauthorizedException('Only the flat owner can assign bills');
    }

    // Check if resident is active for the bill's month
    const resident = bill.flat.residents.find(
      (r) =>
        r.resident_id === dto.residentId &&
        r.start_date <= bill.bill_month &&
        (!r.end_date || r.end_date >= bill.bill_month),
    );

    if (!resident) {
      throw new NotFoundException('Resident not active for this flat in the bill month');
    }

    // Update bill
    const updatedBill = await this.prisma.bill.update({
      where: { id: billId },
      data: { user_id: dto.residentId },
      include: {
        flat: { select: { number: true, flat_type: true } },
        society: { select: { name: true } },
        payments: true,
      },
    }) as BillEntity & {
      flat: { number: string; flat_type: string };
      society: { name: string };
      payments: PaymentEntity[];
    };

    return {
      id: updatedBill.id,
      user_id: updatedBill.user_id,
      flat_id: updatedBill.flat_id,
      society_id: updatedBill.society_id,
      bill_month: updatedBill.bill_month.toISOString(),
      status: updatedBill.status,
      total_amount: updatedBill.total_amount.toNumber(),
      common_charges: updatedBill.common_charges,
      flat_charges: updatedBill.flat_charges,
      flat: updatedBill.flat,
      society: updatedBill.society,
      payments: updatedBill.payments.map((p) => ({
        id: p.id,
        amount: p.amount?.toNumber() ?? 0,
        status: p.status,
        payment_date: p.payment_date.toISOString(),
        tran_id: p.tran_id,
      })),
    };
  }

  // async payBill(billId: number, dto: PayBillDto): Promise<PayBillResponseDto> {
  //   const bill = await this.prisma.bill.findUnique({
  //     where: { id: billId },
  //     include: {
  //       flat: { select: { number: true, flat_type: true } },
  //       society: { select: { name: true } },
  //       payments: true,
  //     },
  //   }) as BillEntity & {
  //     flat: { number: string; flat_type: string };
  //     society: { name: string };
  //     payments: PaymentEntity[];
  //   };

  //   if (!bill) {
  //     throw new NotFoundException('Bill not found');
  //   }

  //   if (bill.user_id !== dto.userId) {
  //     throw new UnauthorizedException('Only the assigned user can pay this bill');
  //   }

  //   if (bill.status === BillStatus.PAID) {
  //     throw new Error('Bill already paid');
  //   }

  //   // Create payment
  //   const payment = await this.prisma.payment.create({
  //     data: {
  //       user_id: dto.userId,
  //       flat_id: bill.flat_id,
  //       bill_id: billId,
  //       society_id: bill.society_id,
  //       amount: dto.amount,
  //       status: PaymentStatus.SUCCESS,
  //       payment_month: bill.bill_month,
  //       payment_date: new Date(),
  //       tran_id: dto.tran_id,
  //       transaction_details: dto.tran_id,
  //       currency: 'BDT',
  //       payment_method: dto.payment_method,
  //     },
  //   }) as PaymentEntity;

  //   // Update bill status
  //   const updatedBill = await this.prisma.bill.update({
  //     where: { id: billId },
  //     data: { status: BillStatus.PAID },
  //     include: {
  //       flat: { select: { number: true, flat_type: true } },
  //       society: { select: { name: true } },
  //       payments: true,
  //     },
  //   }) as BillEntity & {
  //     flat: { number: string; flat_type: string };
  //     society: { name: string };
  //     payments: PaymentEntity[];
  //   };

  //   return {
  //     bill: {
  //       id: updatedBill.id,
  //       user_id: updatedBill.user_id,
  //       flat_id: updatedBill.flat_id,
  //       society_id: updatedBill.society_id,
  //       bill_month: updatedBill.bill_month.toISOString(),
  //       status: updatedBill.status,
  //       total_amount: updatedBill.total_amount.toNumber(),
  //       common_charges: updatedBill.common_charges,
  //       flat_charges: updatedBill.flat_charges,
  //       flat: updatedBill.flat,
  //       society: updatedBill.society,
  //       payments: updatedBill.payments.map((p) => ({
  //         id: p.id,
  //         amount: p.amount?.toNumber() ?? 0,
  //         status: p.status,
  //         payment_date: p.payment_date.toISOString(),
  //         tran_id: p.tran_id,
  //       })),
  //     },
  //     payment: {
  //       id: payment.id,
  //       amount: payment.amount?.toNumber() ?? 0,
  //       status: payment.status,
  //       payment_date: payment.payment_date.toISOString(),
  //       tran_id: payment.tran_id,
  //     },
  //   };
  // }

  async updateBillStatusFromPayment(payment: { bill_id: number; status: PaymentStatus; amount: number }): Promise<BillResponseDto> {
    const bill = await this.prisma.bill.findUnique({
      where: { id: payment.bill_id },
      include: {
        flat: { select: { number: true, flat_type: true } },
        society: { select: { name: true } },
        payments: true,
      },
    }) as BillEntity & {
      flat: { number: string; flat_type: string };
      society: { name: string };
      payments: PaymentEntity[];
    };

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${payment.bill_id} not found`);
    }

    // Only update bill status if payment is successful and amount matches
    let billStatus = bill.status;
    if (payment.status === PaymentStatus.SUCCESS && payment.amount >= bill.total_amount.toNumber()) {
      billStatus = BillStatus.PAID;
    } else if (payment.status === PaymentStatus.FAILED || payment.status === PaymentStatus.CANCELLED) {
      billStatus = BillStatus.PENDING; // Or another status if applicable
    }

    const updatedBill = await this.prisma.bill.update({
      where: { id: payment.bill_id },
      data: { status: billStatus },
      include: {
        flat: { select: { number: true, flat_type: true } },
        society: { select: { name: true } },
        payments: true,
      },
    }) as BillEntity & {
      flat: { number: string; flat_type: string };
      society: { name: string };
      payments: PaymentEntity[];
    };

    return {
      id: updatedBill.id,
      user_id: updatedBill.user_id,
      flat_id: updatedBill.flat_id,
      society_id: updatedBill.society_id,
      bill_month: updatedBill.bill_month.toISOString(),
      status: updatedBill.status,
      total_amount: updatedBill.total_amount.toNumber(),
      common_charges: updatedBill.common_charges,
      flat_charges: updatedBill.flat_charges,
      flat: updatedBill.flat,
      society: updatedBill.society,
      payments: updatedBill.payments.map((p) => ({
        id: p.id,
        amount: p.amount?.toNumber() ?? 0,
        status: p.status,
        payment_date: p.payment_date.toISOString(),
        tran_id: p.tran_id,
      })),
    };
  }
}