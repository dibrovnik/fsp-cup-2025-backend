// src/teams/entities/invitation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';

@Entity({ name: 'invitations' })
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team, (t) => t.invitations, { onDelete: 'CASCADE' })
  team: Team;

  @Column()
  token: string;

  @Column('uuid')
  createdBy: string;

  @Column('timestamptz')
  expiresAt: Date;

  @Column('int', { default: 1 })
  usesLeft: number;

  @CreateDateColumn()
  createdAt: Date;
}
