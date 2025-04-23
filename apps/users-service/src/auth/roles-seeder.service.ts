import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RolesSeederService.name);

  constructor(
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.rolesRepo.count();
    if (count === 0) {
      this.logger.log('Seeding default roles...');
      await this.rolesRepo.save(
        this.rolesRepo.create([
          { name: 'athlete' },
          { name: 'user' },
          { name: 'admin' },
        ]),
      );
      this.logger.log('Roles seeded: athlete, user, admin');
    }
  }
}
