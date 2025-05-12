import { Subscription, PaymentStatus, Society, User, Promo } from '@prisma/client';

export class SubscriptionEntity implements Subscription {
  id: number;
  session_id: string | null;
  tran_id: string | null;
  email: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  society_id: number;
  user_id: number | null;
  promo_id: number | null;
  transaction_details: any | null;  
  created_at: Date;
  updated_at: Date;
  payment_method: string | null;
  payment_date: Date;
  start_date: Date;
  end_date: Date;

  society?: Partial<Society> | null;
  user?: Partial<User> | null;
  promo?: Partial<Promo> | null;
}