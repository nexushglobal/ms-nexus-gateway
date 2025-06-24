import {
  Controller,
  Inject,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { Public } from '../../common/decorators/public.decorator';
import { USERS_SERVICE } from '../../config/services';
import { MigrationBaseService } from '../services/migration-base.service';

@Public()
@Controller('migration/users')
export class UserMigrationController {
  constructor(
    @Inject(USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    private readonly migrationService: MigrationBaseService,
  ) {}

  @Post('files-views-roles')
  @UseInterceptors(FilesInterceptor('files', 3))
  migrateFromFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Observable<any> {
    // Validar archivos
    const foundFiles = this.migrationService.validateMultipleFiles(files, {
      exactFiles: 3,
      requiredFilePatterns: ['roles', 'views', 'relations'],
    });

    // Parsear archivos
    const parsedData = this.migrationService.parseMultipleJsonFiles({
      roles: foundFiles.roles,
      views: foundFiles.views,
      relations: foundFiles.relations,
    });

    // Enviar comando
    return this.migrationService.sendMigrationCommand(this.usersClient, {
      cmd: 'user.migrate.rolesAndViews',
      data: {
        roles: parsedData.roles,
        views: parsedData.views,
        relations: parsedData.relations,
      },
    });
  }

  @Post('users')
  @UseInterceptors(FileInterceptor('file'))
  migrateUsersFromFile(
    @UploadedFile() file: Express.Multer.File,
  ): Observable<any> {
    return this.migrationService.migrateSingleFileArray(
      this.usersClient,
      file,
      'usuarios',
      'user.migrate.users',
      'users',
    );
  }
}
