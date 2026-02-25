import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';
import { EventStatus } from './create-event.dto';

export class UpdateEventStatusDto {
  @Transform(({ value }) => value?.trim())
  @IsIn([EventStatus.ACTIVO, EventStatus.INACTIVO], {
    message: 'The status must be either Activo or Inactivo',
  })
  status: EventStatus;
}
