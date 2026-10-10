import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApprovals1791654598245 implements MigrationInterface {
  name = 'AddApprovals1791654598245';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."approvals_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "approvals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "executionId" uuid NOT NULL, "stepId" uuid NOT NULL, "userId" uuid NOT NULL, "toolName" character varying NOT NULL, "input" jsonb NOT NULL, "status" "public"."approvals_status_enum" NOT NULL DEFAULT 'PENDING', "decidedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_7268349549b7cad4453240c62f7" UNIQUE ("stepId"), CONSTRAINT "PK_690417aaefa84d18b1a59e2a499" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_53a43d993cdd8fcf5bbe2f8036" ON "approvals"  ("executionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1e2101aeb9348435fa104a7c16" ON "approvals"  ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals" ADD CONSTRAINT "FK_53a43d993cdd8fcf5bbe2f8036b" FOREIGN KEY ("executionId") REFERENCES "executions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals" ADD CONSTRAINT "FK_7268349549b7cad4453240c62f7" FOREIGN KEY ("stepId") REFERENCES "execution_steps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals" ADD CONSTRAINT "FK_1e2101aeb9348435fa104a7c166" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "approvals" DROP CONSTRAINT "FK_1e2101aeb9348435fa104a7c166"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals" DROP CONSTRAINT "FK_7268349549b7cad4453240c62f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals" DROP CONSTRAINT "FK_53a43d993cdd8fcf5bbe2f8036b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1e2101aeb9348435fa104a7c16"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_53a43d993cdd8fcf5bbe2f8036"`,
    );
    await queryRunner.query(`DROP TABLE "approvals"`);
    await queryRunner.query(`DROP TYPE "public"."approvals_status_enum"`);
  }
}
