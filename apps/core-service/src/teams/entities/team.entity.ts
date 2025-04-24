// src/teams/entities/team.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TeamMember } from './team-member.entity';
import { Invitation } from './invitation.entity';


export enum TeamStatus {
  RECRUITING = 'recruiting',
  FORMED = 'formed',
  LOCKED = 'locked',
  DISBANDED = 'disbanded',
}

@Entity({ name: 'teams' })
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  captainId: string;

  @Column('int')
  regionId: number;

  @Column('int')
  maxMembers: number;

  @Column({ type: 'enum', enum: TeamStatus, default: TeamStatus.RECRUITING })
  status: TeamStatus;

  @Column({ unique: true })
  inviteCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TeamMember, (m) => m.team, { cascade: true })
  members: TeamMember[];

  @OneToMany(() => Invitation, (i) => i.team, { cascade: true })
  invitations: Invitation[];
}
