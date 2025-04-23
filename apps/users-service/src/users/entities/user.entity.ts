import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Region } from '../../auth/entities/region.entity';
import { UserRole } from '../../auth/entities/user-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'text' })
  password_hash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  middle_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  last_name: string;

  // добавляем отдельное поле FK, которое может быть NULL
  @Column({ type: 'uuid', name: 'region_id', nullable: true })
  regionId?: string;

  @ManyToOne(() => Region, (region) => region.users, {
    nullable: true,
    eager: true, 
  })
  @JoinColumn({ name: 'region_id' })
  region?: Region;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => UserRole, (ur) => ur.user)
  userRoles: UserRole[];
}
