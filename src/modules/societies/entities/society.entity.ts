import { Society as PrismaSociety, SocietyStatus } from '@prisma/client';

export class SocietyEntity implements PrismaSociety {
  id: number;
  name: string;
  address: string | null;  
  postal_code: string | null;  
  city: string | null;  
  state: string | null;  
  country: string | null;  
  created_at: Date;
  updated_at: Date;
  total_flats: number;
  location_lat: number | null;
  location_lng: number | null;
  status: SocietyStatus;
}