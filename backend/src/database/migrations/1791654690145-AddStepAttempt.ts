import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStepAttempt1791654690145 implements MigrationInterface {
  name = 'AddStepAttempt1791654690145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "execution_steps" ADD "attempt" integer NOT NULL DEFAULT '1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "execution_steps" DROP COLUMN "attempt"`,
    );
  }
}
