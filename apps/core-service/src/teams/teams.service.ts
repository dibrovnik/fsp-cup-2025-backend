// src/teams/teams.service.ts
import { Injectable, NotFoundException, Logger, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team, TeamStatus } from './entities/team.entity';
import {
  TeamMember,
  MemberRole,
  MemberStatus,
} from './entities/team-member.entity';
import { Invitation } from './entities/invitation.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectRepository(Team) private teams: Repository<Team>,
    @InjectRepository(TeamMember) private members: Repository<TeamMember>,
    @InjectRepository(Invitation) private invites: Repository<Invitation>,
  ) {}

  async create(dto: CreateTeamDto): Promise<Team> {
    this.logger.log(`Создаём команду ${dto.name}`);
    const code = dto.inviteCode || randomBytes(4).toString('hex').toUpperCase();
    const team = this.teams.create({ ...dto, inviteCode: code });
    return this.teams.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teams.find({ relations: ['members', 'invitations'] });
  }

  async findOne(id: string): Promise<Team> {
    const t = await this.teams.findOne({
      where: { id },
      relations: ['members', 'invitations'],
    });
    if (!t) throw new HttpException(`Team ${id} not found`, 404);
    return t;
  }

  async update(id: string, dto: UpdateTeamDto): Promise<Team> {
    const res = await this.teams.update(id, dto);
    if (res.affected === 0) throw new NotFoundException(`Team ${id} not found`);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ statusCode: number; message: string }> {
    console.log('Удаляем команду', id);
    const res = await this.teams.delete(id);
    console.log('Удаляем команду', res);
    if (res.affected == 0) throw new NotFoundException(`Team ${id} not found`);

    return { statusCode: 200, message: 'Deleted' };
  }

  async inviteByCode(code: string, userId: string): Promise<TeamMember> {
    const team = await this.teams.findOne({ where: { inviteCode: code } });
    if (!team) throw new NotFoundException(`Invite code ${code} invalid`);
    const status =
      team.status === TeamStatus.RECRUITING
        ? MemberStatus.INVITED
        : MemberStatus.PENDING;
    const member = this.members.create({
      team,
      userId,
      role: MemberRole.MEMBER,
      status,
    });
    return this.members.save(member);
  }

  async createInvitation(
    teamId: string,
    createdBy: string,
    usesLeft = 1,
  ): Promise<Invitation> {
    const team = await this.teams.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException(`Team ${teamId} not found`);
    const token = randomBytes(8).toString('hex');
    const inv = this.invites.create({
      team,
      token,
      createdBy,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // неделя
      usesLeft,
    });
    return this.invites.save(inv);
  }

  async joinByLink(token: string, userId: string): Promise<TeamMember> {
    const inv = await this.invites.findOne({
      where: { token },
      relations: ['team'],
    });
    if (!inv || inv.expiresAt < new Date() || inv.usesLeft < 1) {
      throw new NotFoundException(`Invitation token invalid`);
    }
    inv.usesLeft--;
    await this.invites.save(inv);
    const member = this.members.create({
      team: inv.team,
      userId,
      role: MemberRole.MEMBER,
      status: MemberStatus.INVITED,
    });
    return this.members.save(member);
  }

  async confirmMember(
    teamId: string,
    userId: string,
    accept: boolean,
  ): Promise<TeamMember> {
    const m = await this.members.findOne({
      where: { team: { id: teamId } as any, userId },
      relations: ['team'],
    });
    if (!m) throw new NotFoundException(`Member not found`);
    m.status = accept ? MemberStatus.CONFIRMED : MemberStatus.REJECTED;
    const saved = await this.members.save(m);

    // авто-обновление статуса команды
    const confirmed = await this.members.count({
      where: { team: { id: teamId } as any, status: MemberStatus.CONFIRMED },
    });
    const team = m.team;
    if (confirmed >= team.maxMembers) {
      team.status = TeamStatus.FORMED;
      await this.teams.save(team);
    }
    return saved;
  }

  /**
   * Получить все команды, в которых участвует пользователь
   */
  async findByUser(userId: string): Promise<Team[]> {
    const memberships = await this.members.find({
      where: { userId },
      relations: ['team'],
    });

    if (!memberships.length) {
      throw new NotFoundException(`No teams found for user ${userId}`);
    }

    // достаём из связей команды
    return memberships.map((m) => m.team);
  }

  
}
