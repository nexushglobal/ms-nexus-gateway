import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { LotTransactionRole } from '../enums/lot-transaction-role.enum';

export class FindAllSalesDto extends PaginationDto {
  @IsOptional()
  @IsEnum(LotTransactionRole, {
    message: 'El campo rol del usuario en venta debe ser: Comprador o Vendedor',
  })
  lotTransactionRole?: LotTransactionRole;
}
