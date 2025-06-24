import {
  BadRequestException,
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
import {
  USERS_SERVICE,
  PAYMENT_SERVICE,
  MEMBERSHIP_SERVICE,
} from '../config/services';
import { Public } from 'src/common/decorators/public.decorator';

@Public()
@Controller('migration')
export class MigrationController {
  constructor(
    @Inject(USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy,
    @Inject(MEMBERSHIP_SERVICE)
    private readonly membershipClient: ClientProxy,
  ) {}

  @Post('files-views-roles')
  @UseInterceptors(FilesInterceptor('files', 3))
  migrateFromFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Observable<any> {
    if (!files || files.length !== 3) {
      throw new BadRequestException(
        'Se requieren exactamente 3 archivos: roles.json, views.json, relations.json',
      );
    }

    try {
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

  @Post('users')
  @UseInterceptors(FileInterceptor('file'))
  migrateUsersFromFile(
    @UploadedFile() file: Express.Multer.File,
  ): Observable<any> {
    console.log('Archivo de usuarios recibido:', file?.originalname);

    if (!file) {
      throw new BadRequestException(
        'Se requiere un archivo JSON con los datos de usuarios',
      );
    }

    if (!file.originalname.toLowerCase().endsWith('.json')) {
      throw new BadRequestException('El archivo debe ser de tipo JSON');
    }

    try {
      const users = JSON.parse(file.buffer.toString('utf8'));

      if (!Array.isArray(users)) {
        throw new BadRequestException(
          'El archivo JSON debe contener un array de usuarios',
        );
      }

      return this.usersClient.send({ cmd: 'user.migrate.users' }, { users });
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('El archivo JSON tiene formato inválido');
      }
      throw new BadRequestException(
        `Error procesando archivo: ${error.message}`,
      );
    }
  }

  @Post('payment-configs')
  @UseInterceptors(FileInterceptor('file'))
  migratePaymentConfigsFromFile(
    @UploadedFile() file: Express.Multer.File,
  ): Observable<any> {
    console.log(
      'Archivo de configuraciones de pago recibido:',
      file?.originalname,
    );

    if (!file) {
      throw new BadRequestException(
        'Se requiere un archivo JSON con los datos de configuraciones de pago',
      );
    }

    if (!file.originalname.toLowerCase().endsWith('.json')) {
      throw new BadRequestException('El archivo debe ser de tipo JSON');
    }

    try {
      const paymentConfigs = JSON.parse(file.buffer.toString('utf8'));

      if (!Array.isArray(paymentConfigs)) {
        throw new BadRequestException(
          'El archivo JSON debe contener un array de configuraciones de pago',
        );
      }

      return this.paymentClient.send(
        { cmd: 'payment.migrate.paymentConfigs' },
        { paymentConfigs },
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('El archivo JSON tiene formato inválido');
      }
      throw new BadRequestException(
        `Error procesando archivo: ${error.message}`,
      );
    }
  }

  @Post('membership-plans')
  @UseInterceptors(FileInterceptor('file'))
  migrateMembershipPlansFromFile(
    @UploadedFile() file: Express.Multer.File,
  ): Observable<any> {
    console.log('Archivo de planes de membresía recibido:', file?.originalname);

    if (!file) {
      throw new BadRequestException(
        'Se requiere un archivo JSON con los datos de planes de membresía',
      );
    }

    if (!file.originalname.toLowerCase().endsWith('.json')) {
      throw new BadRequestException('El archivo debe ser de tipo JSON');
    }

    try {
      const membershipPlans = JSON.parse(file.buffer.toString('utf8'));

      if (!Array.isArray(membershipPlans)) {
        throw new BadRequestException(
          'El archivo JSON debe contener un array de planes de membresía',
        );
      }

      return this.membershipClient.send(
        { cmd: 'membership.migrate.membershipPlans' },
        { membershipPlans },
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('El archivo JSON tiene formato inválido');
      }
      throw new BadRequestException(
        `Error procesando archivo: ${error.message}`,
      );
    }
  }
}
