import { IsBoolean } from 'class-validator';

export class UpdateWelcomeKitStatusDto {
  @IsBoolean()
  welcomeKitDelivered: boolean;
}
