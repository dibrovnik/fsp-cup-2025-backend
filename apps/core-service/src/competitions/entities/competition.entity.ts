// src/competitions/entities/competition.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CompetitionStatus } from './competition-status.enum';

export enum CompetitionType {
  OPEN = 'open',
  REGIONAL = 'regional',
  FEDERAL = 'federal',
}
export enum Discipline {
  PRODUCT = 'product',
  SECURITY = 'security',
  ALGO = 'algo',
  ROBOT = 'robot',
  UAV = 'uav',
}

export enum ParticipationFormat {
  SOLO = 'solo',
  TEAM = 'team',
}

@Entity({ name: 'competitions' })
export class Competition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: CompetitionType })
  type: CompetitionType;

  @Column({ type: 'enum', enum: Discipline })
  discipline: Discipline;

  @Column('timestamptz')
  startDate: Date;

  @Column('timestamptz')
  endDate: Date;

  @Column({ nullable: true })
  regionId?: number;

  @Column({
    type: 'enum',
    enum: CompetitionStatus,
    default: CompetitionStatus.IN_PROGRESS,
  })
  status: CompetitionStatus;

  @Column({
    type: 'enum',
    enum: ParticipationFormat,
    default: ParticipationFormat.TEAM,
  })
  participationFormat: ParticipationFormat;
}
