import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentOriginal1794420084787 implements MigrationInterface {
  name = 'AddDocumentOriginal1794420084787';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "knowledge_documents" ADD "original" bytea`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "knowledge_documents" DROP COLUMN "original"`,
    );
  }
}
