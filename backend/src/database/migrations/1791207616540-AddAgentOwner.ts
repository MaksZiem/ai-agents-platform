import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAgentOwner1791207616540 implements MigrationInterface {
  name = 'AddAgentOwner1791207616540';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "agents" ADD "userId" uuid NOT NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_f535e5b2c0f0dc7b7fc656ebc9" ON "agents"  ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "agents" ADD CONSTRAINT "FK_f535e5b2c0f0dc7b7fc656ebc91" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agents" DROP CONSTRAINT "FK_f535e5b2c0f0dc7b7fc656ebc91"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f535e5b2c0f0dc7b7fc656ebc9"`,
    );
    await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN "userId"`);
  }
}
