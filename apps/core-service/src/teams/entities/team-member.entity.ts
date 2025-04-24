// src/teams/entities/team-member.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';

export enum MemberRole {
  CAPTAIN = 'captain',
  MEMBER = 'member',
}

export enum MemberStatus {
  PENDING = 'pending',
  INVITED = 'invited',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

@Entity({ name: 'team_members' })
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team, (t) => t.members, { onDelete: 'CASCADE' })
  team: Team;

  @Column('uuid')
  userId: string;

  @Column({ type: 'enum', enum: MemberRole, default: MemberRole.MEMBER })
  role: MemberRole;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.PENDING })
  status: MemberStatus;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  respondedAt: Date;
}
