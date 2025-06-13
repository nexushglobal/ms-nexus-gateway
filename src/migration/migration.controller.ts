import {
  BadRequestException,
  Controller,
  Inject,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { USERS_SERVICE } from '../config/services';

@Controller('migration')
export class MigrationController {
  constructor(
    @Inject(USERS_SERVICE)
    private readonly usersClient: ClientProxy,
  ) {}

  @Post('files-views-roles')
  @UseInterceptors(FilesInterceptor('files', 3))
  migrateFromFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Observable<any> {
    console.log('Archivos recibidos:', files);
    if (!files || files.length !== 3) {
      throw new BadRequestException(
        'Se requieren exactamente 3 archivos: roles.json, views.json, relations.json',
      );
    }

    try {
      // Buscar y parsear cada archivo
      const rolesFile = files.find(
        (f) =>
          f.originalname.includes('roles') || f.originalname.includes('role'),
      );
      const viewsFile = files.find(
        (f) =>
          f.originalname.includes('views') || f.originalname.includes('view'),
      );
      const relationsFile = files.find(
        (f) =>
          f.originalname.includes('relations') ||
          f.originalname.includes('relation'),
      );

      if (!rolesFile || !viewsFile || !relationsFile) {
        throw new BadRequestException(
          'Los archivos deben contener "roles", "views" y "relations" en sus nombres',
        );
      }

      // Parsear JSON de cada archivo
      const roles = JSON.parse(rolesFile.buffer.toString('utf8'));
      const views = JSON.parse(viewsFile.buffer.toString('utf8'));
      const relations = JSON.parse(relationsFile.buffer.toString('utf8'));

      return this.usersClient.send(
        { cmd: 'user.migrate.rolesAndViews' },
        { roles, views, relations },
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException(
          'Uno o más archivos JSON tienen formato inválido',
        );
      }
      throw new BadRequestException(
        `Error procesando archivos: ${error.message}`,
      );
    }
  }
}
