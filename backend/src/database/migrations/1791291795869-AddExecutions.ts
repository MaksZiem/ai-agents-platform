import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExecutions1791291795869 implements MigrationInterface {
  name = 'AddExecutions1791291795869';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."executions_status_enum" AS ENUM('QUEUED', 'RUNNING', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "executions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "agentId" uuid NOT NULL, "userId" uuid NOT NULL, "task" text NOT NULL, "status" "public"."executions_status_enum" NOT NULL DEFAULT 'QUEUED', "result" text, "error" text, "startedAt" TIMESTAMP WITH TIME ZONE, "finishedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_703e64e0ef651986191844b7b8b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_347c2642f99a428ab6a1e80547" ON "executions"  ("agentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c746960f44db10f2a8cd7d6d06" ON "executions"  ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "executions" ADD CONSTRAINT "FK_347c2642f99a428ab6a1e805479" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "executions" ADD CONSTRAINT "FK_c746960f44db10f2a8cd7d6d064" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "executions" DROP CONSTRAINT "FK_c746960f44db10f2a8cd7d6d064"`,
    );
    await queryRunner.query(
      `ALTER TABLE "executions" DROP CONSTRAINT "FK_347c2642f99a428ab6a1e805479"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c746960f44db10f2a8cd7d6d06"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_347c2642f99a428ab6a1e80547"`,
    );
    await queryRunner.query(`DROP TABLE "executions"`);
    await queryRunner.query(`DROP TYPE "public"."executions_status_enum"`);
  }
}
