import { IsNumber, IsDate, IsOptional, Min, Max, IsInt } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class SearchQueryDto {
  @IsNumber()
  @Type(() => Number)
  longitude: number;

  @IsNumber()
  @Type(() => Number)
  latitude: number;

  @Expose({ name: 'check_in' })
  @Type(() => Date)
  @IsDate()
  checkIn: Date;

  @Expose({ name: 'check_out' })
  @IsDate()
  @Type(() => Date)
  checkOut: Date;

  @Expose({ name: 'min_price' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @Expose({ name: 'max_price' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @Expose({ name: 'num_of_guests' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  numOfGuests?: number;

  @Expose({ name: 'sw_lng' })
  @IsNumber()
  @Type(() => Number)
  swLng: number;

  @Expose({ name: 'sw_lat' })
  @IsNumber()
  @Type(() => Number)
  swLat: number;

  @Expose({ name: 'ne_lng' })
  @IsNumber()
  @Type(() => Number)
  neLng: number;

  @Expose({ name: 'ne_lat' })
  @IsNumber()
  @Type(() => Number)
  neLat: number;
}
