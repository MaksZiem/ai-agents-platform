import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConnections1794439497021 implements MigrationInterface {
  name = 'AddConnections1794439497021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "connections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "name" character varying(64) NOT NULL, "description" character varying(500), "baseUrl" character varying(2048) NOT NULL, "authType" character varying(16) NOT NULL DEFAULT 'none', "authHeaderName" character varying(100), "secret" text, "hasSecret" boolean NOT NULL DEFAULT false, "allowedMethods" text array NOT NULL DEFAULT '{GET}', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2a1c083de7496c4525f5e9c9b38" UNIQUE ("userId", "name"), CONSTRAINT "PK_0a1f844af3122354cbd487a8d03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c8ee0b9afe383566cbe9243a09" ON "connections"  ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "agent_connections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "agentId" uuid NOT NULL, "connectionId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_d562c7c4484a7e338b314d6ceab" UNIQUE ("agentId", "connectionId"), CONSTRAINT "PK_678c9fc5c87a2b46bb544cd51c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_28c99c96d8aa0d19e0454c63eb" ON "agent_connections"  ("connectionId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "connections" ADD CONSTRAINT "FK_c8ee0b9afe383566cbe9243a09f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_connections" ADD CONSTRAINT "FK_59be560e9c069fbf0889ad472f0" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_connections" ADD CONSTRAINT "FK_28c99c96d8aa0d19e0454c63ebb" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agent_connections" DROP CONSTRAINT "FK_28c99c96d8aa0d19e0454c63ebb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_connections" DROP CONSTRAINT "FK_59be560e9c069fbf0889ad472f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "connections" DROP CONSTRAINT "FK_c8ee0b9afe383566cbe9243a09f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_28c99c96d8aa0d19e0454c63eb"`,
    );
    await queryRunner.query(`DROP TABLE "agent_connections"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c8ee0b9afe383566cbe9243a09"`,
    );
    await queryRunner.query(`DROP TABLE "connections"`);
  }
}
