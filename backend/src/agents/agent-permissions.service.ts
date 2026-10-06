import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  isSupportedPermission,
  RESOURCE_ACTIONS,
} from '../tools/permissions.js';
import type { ToolAction, ToolResource } from '../tools/tool-definition.js';
import { AgentsService } from './agents.service.js';
import { PermissionDto } from './dto/update-agent-permissions.dto.js';
import { AgentPermission } from './entities/agent-permission.entity.js';

@Injectable()
export class AgentPermissionsService {
  constructor(
    @InjectRepository(AgentPermission)
    private readonly agentPermissionsRepository: Repository<AgentPermission>,
    private readonly agentsService: AgentsService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(agentId: string, userId: string) {
    await this.agentsService.findOne(agentId, userId);

    const granted = await this.agentPermissionsRepository.findBy({ agentId });
    const grantedKeys = new Set(
      granted.map(
        (permission) => `${permission.resource}:${permission.action}`,
      ),
    );

    return (Object.keys(RESOURCE_ACTIONS) as ToolResource[]).map(
      (resource) => ({
        resource,
        actions: RESOURCE_ACTIONS[resource].map((action) => ({
          action,
          granted: grantedKeys.has(`${resource}:${action}`),
        })),
      }),
    );
  }

  async replace(agentId: string, permissions: PermissionDto[], userId: string) {
    await this.agentsService.findOne(agentId, userId);

    const unique = new Map<
      string,
      { resource: ToolResource; action: ToolAction }
    >();

    for (const { resource, action } of permissions) {
      if (!isSupportedPermission(resource, action)) {
        throw new BadRequestException(
          `Unsupported permission: ${resource}:${action}`,
        );
      }

      unique.set(`${resource}:${action}`, {
        resource,
        action: action as ToolAction,
      });
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(AgentPermission, { agentId });
      await manager.save(
        [...unique.values()].map((permission) =>
          manager.create(AgentPermission, { agentId, ...permission }),
        ),
      );
    });

    return this.findAll(agentId, userId);
  }
}
