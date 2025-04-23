// src/competitions/dto/competition.dto.ts
export class CompetitionDto {
  id: string;
  name: string;
  type: string;
  discipline: string;
  startDate: string;
  endDate: string;
  regionId?: string;
}
