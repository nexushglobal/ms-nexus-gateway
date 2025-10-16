import { IsEnum } from 'class-validator';
import { EventStatus } from './create-event.dto';

export class UpdateEventStatusDto {
  @IsEnum(EventStatus, {
    message: 'The status must be a valid EventStatus',
  })
  status: EventStatus;
}
