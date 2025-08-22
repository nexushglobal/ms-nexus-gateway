import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';

export class BannerOrderItem {
  @IsNumber()
  @IsPositive()
  id: number;

  @IsNumber()
  @IsPositive()
  order: number;
}

export class OrderBannersDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un banner' })
  @ValidateNested({ each: true })
  @Type(() => BannerOrderItem)
  banners: BannerOrderItem[];
}
