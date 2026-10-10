import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExecutionUsage1791658081306 implements MigrationInterface {
  name = 'AddExecutionUsage1791658081306';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "executions" ADD "model" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "executions" ADD "llmCalls" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "executions" ADD "inputTokens" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "executions" ADD "outputTokens" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "executions" DROP COLUMN "outputTokens"`,
    );
    await queryRunner.query(
      `ALTER TABLE "executions" DROP COLUMN "inputTokens"`,
    );
    await queryRunner.query(`ALTER TABLE "executions" DROP COLUMN "llmCalls"`);
    await queryRunner.query(`ALTER TABLE "executions" DROP COLUMN "model"`);
  }
}
