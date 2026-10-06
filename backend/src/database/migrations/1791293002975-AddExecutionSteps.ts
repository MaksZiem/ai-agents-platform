import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExecutionSteps1791293002975 implements MigrationInterface {
  name = 'AddExecutionSteps1791293002975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."execution_steps_type_enum" AS ENUM('PLAN', 'TOOL_CALL', 'FINAL_ANSWER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."execution_steps_status_enum" AS ENUM('PENDING', 'RUNNING', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'FAILED', 'SKIPPED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "execution_steps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "executionId" uuid NOT NULL, "position" integer NOT NULL, "type" "public"."execution_steps_type_enum" NOT NULL, "status" "public"."execution_steps_status_enum" NOT NULL DEFAULT 'PENDING', "toolName" character varying, "input" jsonb, "output" jsonb, "error" text, "startedAt" TIMESTAMP WITH TIME ZONE, "finishedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_01aa209f9c4d0568c11c6b65251" UNIQUE ("executionId", "position"), CONSTRAINT "PK_c04cbd28a0bbe6b7f7d17fa0abc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "execution_steps" ADD CONSTRAINT "FK_a7a3594df6e0322ca8c45bfea74" FOREIGN KEY ("executionId") REFERENCES "executions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "execution_steps" DROP CONSTRAINT "FK_a7a3594df6e0322ca8c45bfea74"`,
    );
    await queryRunner.query(`DROP TABLE "execution_steps"`);
    await queryRunner.query(`DROP TYPE "public"."execution_steps_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."execution_steps_type_enum"`);
  }
}
