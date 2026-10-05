import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAgentTools1791212847139 implements MigrationInterface {
  name = 'AddAgentTools1791212847139';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "agent_tools" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "agentId" uuid NOT NULL, "toolName" character varying NOT NULL, "requiresApproval" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_9890ed87f8a5d059339b0d15ba8" UNIQUE ("agentId", "toolName"), CONSTRAINT "PK_950db085e94f8d3fd8b9728d62b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_tools" ADD CONSTRAINT "FK_ed18c00c9aa6bede04bbb74d980" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agent_tools" DROP CONSTRAINT "FK_ed18c00c9aa6bede04bbb74d980"`,
    );
    await queryRunner.query(`DROP TABLE "agent_tools"`);
  }
}
