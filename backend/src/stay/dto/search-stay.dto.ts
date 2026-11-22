import { IsNumber, IsDate, IsOptional, Min, Max, IsInt } from 'class-validator';

export class SearchStayDto {
  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;

  @IsDate()
  checkIn: Date;

  @IsDate()
  checkOut: Date;

  @IsOptional()
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  numOfGuests?: number;

  @IsNumber()
  swLng: number;

  @IsNumber()
  swLat: number;

  @IsNumber()
  neLng: number;

  @IsNumber()
  neLat: number;
}
