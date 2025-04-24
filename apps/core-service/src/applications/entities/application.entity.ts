// src/applications/entities/application.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Competition } from '../../competitions/entities/competition.entity';
import { Team } from '../../teams/entities/team.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity({ name: 'applications' })
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Ссылка на соревнование
  @ManyToOne(() => Competition, { onDelete: 'CASCADE' })
  competition: Competition;

  // Заявка может быть командной или индивидуальной:
  @ManyToOne(() => Team, { nullable: true, onDelete: 'SET NULL' })
  team?: Team;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  // Комментарий при отклонении / одобрении
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
