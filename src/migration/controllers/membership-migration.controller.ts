import {
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { MEMBERSHIP_SERVICE } from '../../config/services';
import { Public } from '../../common/decorators/public.decorator';
import { MigrationBaseService } from '../services/migration-base.service';

@Public()
@Controller('migration/memberships')
export class MembershipMigrationController {
  constructor(
    @Inject(MEMBERSHIP_SERVICE)
    private readonly membershipClient: ClientProxy,
    private readonly migrationService: MigrationBaseService,
  ) {}

  @Post('membership-plans')
  @UseInterceptors(FileInterceptor('file'))
  migrateMembershipPlansFromFile(
    @UploadedFile() file: Express.Multer.File,
  ): Observable<any> {
    return this.migrationService.migrateSingleFileArray(
      this.membershipClient,
      file,
      'planes de membresía',
      'membership.migrate.membershipPlans',
      'membershipPlans',
    );
  }
}
