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

  findAll(): Promise<Agent[]> {
    return this.agentsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Agent> {
    const agent = await this.agentsRepository.findOneBy({ id });

    if (!agent) {
      throw new NotFoundException(`Agent ${id} not found`);
    }

    return agent;
  }

  create(dto: CreateAgentDto): Promise<Agent> {
    const agent = this.agentsRepository.create(dto);
    return this.agentsRepository.save(agent);
  }

  async update(id: string, dto: UpdateAgentDto): Promise<Agent> {
    const agent = await this.findOne(id);
    this.agentsRepository.merge(agent, dto);
    return this.agentsRepository.save(agent);
  }

  async remove(id: string): Promise<void> {
    const agent = await this.findOne(id);
    await this.agentsRepository.remove(agent);
  }
}
