import { MigrationInterface, QueryRunner } from "typeorm";

export class AddApprovalAnswer1794470586414 implements MigrationInterface {
    name = 'AddApprovalAnswer1794470586414'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approvals" ADD "answer" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approvals" DROP COLUMN "answer"`);
    }

}
