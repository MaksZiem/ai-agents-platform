import { Injectable } from '@nestjs/common';
import { Agent } from './agents/entities/agent.entity.js';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  async getHealth() {
    const agents = await this.dataSource.getRepository(Agent).count();
    return { status: 'ok', database: 'up', agents };
  }
}

// prodziekan wydzialu do spraw nauczenia krzysiek
// do spraw studenckich pani agata

