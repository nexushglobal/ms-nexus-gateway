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
import { Public } from '../../common/decorators/public.decorator';
import { POINT_SERVICE } from '../../config/services';
import { MigrationBaseService } from '../services/migration-base.service';

@Public()
@Controller('migration/points')
export class PointMigrationController {
  constructor(
    @Inject(POINT_SERVICE)
    private readonly pointClient: ClientProxy,
    private readonly migrationService: MigrationBaseService,
  ) {}

  @Post('user-points')
  @UseInterceptors(FileInterceptor('file'))
  migrateUserPointsFromFile(
    @UploadedFile() file: Express.Multer.File,
  ): Observable<any> {
    console.log(
      '📁 Archivo de puntos de usuarios recibido:',
      file?.originalname,
    );

    return this.migrationService.migrateSingleFileArray(
      this.pointClient,
      file,
      'puntos de usuarios',
      'point.migrate.userPoints',
      'userPoints',
    );
  }

  @Post('weekly-volumes')
  @UseInterceptors(FileInterceptor('file'))
  migrateWeeklyVolumesFromFile(
    @UploadedFile() file: Express.Multer.File,
  ): Observable<any> {
    console.log(
      '📁 Archivo de volúmenes semanales recibido:',
      file?.originalname,
    );

    return this.migrationService.migrateSingleFileArray(
      this.pointClient,
      file,
      'volúmenes semanales',
      'point.migrate.weeklyVolumes',
      'weeklyVolumes',
    );
  }
}
