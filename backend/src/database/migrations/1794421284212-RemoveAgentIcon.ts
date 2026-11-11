import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAgentIcon1794421284212 implements MigrationInterface {
  name = 'RemoveAgentIcon1794421284212';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN "icon"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agents" ADD "icon" character varying(32)`,
    );
  }
}
