// src/competitions/entities/competition.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  regionId?: string;
}
