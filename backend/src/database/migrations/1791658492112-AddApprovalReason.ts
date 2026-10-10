import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApprovalReason1791658492112 implements MigrationInterface {
  name = 'AddApprovalReason1791658492112';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "approvals" ADD "reason" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "approvals" DROP COLUMN "reason"`);
  }
}
