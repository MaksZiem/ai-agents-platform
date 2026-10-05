import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from './entities/agent.entity.js';
import { CreateAgentDto } from './dto/create-agent.dto.js';
import { UpdateAgentDto } from './dto/update-agent.dto.js';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentsRepository: Repository<Agent>,
  ) {}

  findAll(userId: string): Promise<Agent[]> {
    return this.agentsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Agent> {
    const agent = await this.agentsRepository.findOneBy({ id, userId });

    if (!agent) {
      throw new NotFoundException(`Agent ${id} not found`);
    }

    return agent;
  }

  create(dto: CreateAgentDto, userId: string): Promise<Agent> {
    const agent = this.agentsRepository.create({...dto, userId});
    return this.agentsRepository.save(agent);
  }

  async update(id: string, dto: UpdateAgentDto, userId: string): Promise<Agent> {
    const agent = await this.findOne(id, userId);
    this.agentsRepository.merge(agent, dto);
    return this.agentsRepository.save(agent);
  }

  async remove(id: string, userId: string): Promise<void> {
    const agent = await this.findOne(id, userId);
    await this.agentsRepository.remove(agent);
  }
}
