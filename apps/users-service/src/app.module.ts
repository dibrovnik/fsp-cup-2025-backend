import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersController } from './users/users.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Role } from './auth/entities/role.entity';
import { RolesSeederService } from './auth/roles-seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    TypeOrmModule.forFeature([Role]),
  ],
  controllers: [AppController],
  providers: [AppService, RolesSeederService],
})
export class AppModule {}
