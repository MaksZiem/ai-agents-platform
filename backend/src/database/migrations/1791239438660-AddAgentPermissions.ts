import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAgentPermissions1791239438660 implements MigrationInterface {
  name = 'AddAgentPermissions1791239438660';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "agent_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "agentId" uuid NOT NULL, "resource" character varying NOT NULL, "action" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_d0693bd60502f5d003984562cc7" UNIQUE ("agentId", "resource", "action"), CONSTRAINT "PK_12e02199dde211f424f9bc6c467" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_permissions" ADD CONSTRAINT "FK_829e5a0fffbab87346b5de5e6f0" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agent_permissions" DROP CONSTRAINT "FK_829e5a0fffbab87346b5de5e6f0"`,
    );
    await queryRunner.query(`DROP TABLE "agent_permissions"`);
  }
}
