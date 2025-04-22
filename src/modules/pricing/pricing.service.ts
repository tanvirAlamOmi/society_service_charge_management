import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingInfoDto, ApplyPromoDto } from './dto/create-pricing.dto';
import { FlatType, PromoType } from '@prisma/client';

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateRegistrationPrice(buildingInfo: BuildingInfoDto) {
    const { flats, location_lat, location_lng, user_emails } = buildingInfo;

    // Base pricing per flat type
    const flatPrices: Record<FlatType, number> = { 
      [FlatType.TWO_BHK]: 8000,
      [FlatType.THREE_BHK]: 12000,
      [FlatType.FOUR_BHK]: 15000,
    };

    // Calculate flat cost
    let totalFlatCost = 500;
    // const flatCounts: Record<FlatType, number> = { 
    //   [FlatType.TWO_BHK]: 0,
    //   [FlatType.THREE_BHK]: 0,
    //   [FlatType.FOUR_BHK]: 0,
    // };

    // flats.forEach(flat => {
    //   totalFlatCost += flatPrices[flat.flat_type];
    //   flatCounts[flat.flat_type]++;
    // });

    // // Location-based adjustment
    // let locationMultiplier = 1.0;
    // if (location_lat && location_lng) {
    //   const isUrban = await this.isUrbanLocation(location_lat, location_lng);
    //   locationMultiplier = isUrban ? 1.2 : 1.0;
    // }

    // // User count cost
    // const userCountCost = user_emails.length * 1000;

    // Total price
    const basePrice = totalFlatCost  ;
    const tax = basePrice * 0.15;
    const totalPrice = basePrice + tax;

    return {
      base_price: basePrice,
      tax,
      total_price: totalPrice,
      // flat_counts: flatCounts,
      // user_count: user_emails.length,
      // location_multiplier: locationMultiplier,
    };
  }

  async applyPromo(dto: ApplyPromoDto) {
    const { promo_code, original_amount, user_email, location_lat, location_lng, flats } = dto;

    const promo = await this.prisma.promo.findUnique({ where: { code: promo_code } });
    if (!promo || promo.status !== 'ACTIVE') {
      throw new BadRequestException('Invalid or inactive promo code');
    }

    switch (promo.type) {
      case PromoType.EXPIRY_DATE:
        if (promo.expiry_date && new Date() > promo.expiry_date) {
          await this.prisma.promo.update({
            where: { id: promo.id },
            data: { status: 'EXPIRED' },
          });
          throw new BadRequestException('Promo code has expired');
        }
        break;

      case PromoType.USER_BASED:
        if (!user_email || !promo.user_id) {
          throw new BadRequestException('User-based promo requires email');
        }
        const user = await this.prisma.user.findUnique({ where: { email: user_email } });
        if (!user || user.id !== promo.user_id) {
          throw new BadRequestException('Promo code not valid for this user');
        }
        break;

      case PromoType.LOCATION_BASED:
        if (!location_lat || !location_lng || !promo.location_lat || !promo.location_lng || !promo.location_radius) {
          throw new BadRequestException('Location-based promo requires coordinates');
        }
        const distance = this.calculateDistance(
          location_lat,
          location_lng,
          promo.location_lat,
          promo.location_lng,
        );
        if (distance > promo.location_radius) {
          throw new BadRequestException('Promo code not valid for this location');
        }
        break;

      case PromoType.AMOUNT_BASED:
        if (promo.min_amount && original_amount < promo.min_amount) {
          throw new BadRequestException(`Promo requires minimum amount of ${promo.min_amount}`);
        }
        break;

      case PromoType.FLAT_BASED:
        if (!flats || !promo.flat_type) {
          throw new BadRequestException('Flat-based promo requires flat details');
        }
        const hasMatchingFlat = flats.some(flat => flat.flat_type === promo.flat_type);
        if (!hasMatchingFlat) {
          throw new BadRequestException(`Promo requires ${promo.flat_type} flat`);
        }
        break;

      default:
        throw new BadRequestException('Unknown promo type');
    }

    let discount = promo.discount;
    if (promo.type !== PromoType.AMOUNT_BASED) {
      discount = original_amount * (promo.discount / 100);
    }
    if (promo.max_discount && discount > promo.max_discount) {
      discount = promo.max_discount;
    }

    const discountedAmount = Math.max(0, original_amount - discount);

    return {
      original_amount,
      discount,
      discounted_amount: discountedAmount,
      promo_code: promo.code,
    };
  }

  private async isUrbanLocation(lat: number, lng: number): Promise<boolean> {
    const dhakaLat = 23.8;
    const dhakaLng = 90.4;
    const distance = this.calculateDistance(lat, lng, dhakaLat, dhakaLng);
    return distance <= 50;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}