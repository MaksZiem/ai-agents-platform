import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGeneratedFiles1794396631771 implements MigrationInterface {
  name = 'AddGeneratedFiles1794396631771';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "generated_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "executionId" uuid NOT NULL, "name" character varying NOT NULL, "mimeType" character varying NOT NULL, "sizeBytes" integer NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d65b0f247c14a5a49c9f747ba42" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_440d07e559bc48386fa90c3639" ON "generated_files"  ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_90fb5534aacb35a11c6a85347b" ON "generated_files"  ("executionId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "generated_files" ADD CONSTRAINT "FK_440d07e559bc48386fa90c36397" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "generated_files" ADD CONSTRAINT "FK_90fb5534aacb35a11c6a85347bf" FOREIGN KEY ("executionId") REFERENCES "executions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "generated_files" DROP CONSTRAINT "FK_90fb5534aacb35a11c6a85347bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "generated_files" DROP CONSTRAINT "FK_440d07e559bc48386fa90c36397"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_90fb5534aacb35a11c6a85347b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_440d07e559bc48386fa90c3639"`,
    );
    await queryRunner.query(`DROP TABLE "generated_files"`);
  }
}
