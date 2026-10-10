import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKnowledge1791659148764 implements MigrationInterface {
  name = 'AddKnowledge1791659148764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "knowledge_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "name" character varying NOT NULL, "mimeType" character varying NOT NULL, "sizeBytes" integer NOT NULL, "characterCount" integer NOT NULL, "chunkCount" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_402a3c43fb263aa5289670e4e21" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a3adeafc92a4a0cf6da7c5a2a0" ON "knowledge_documents"  ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "agent_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "agentId" uuid NOT NULL, "documentId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_3b89e4eb37763437d02f83b8c42" UNIQUE ("agentId", "documentId"), CONSTRAINT "PK_e0c24c11a0a58a4ebb0567511c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_37dec937def2652006921c0bd9" ON "agent_documents"  ("documentId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "document_chunks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "documentId" uuid NOT NULL, "position" integer NOT NULL, "content" text NOT NULL, CONSTRAINT "UQ_65ed2153d0c2af384741b1414ff" UNIQUE ("documentId", "position"), CONSTRAINT "PK_7f9060084e9b872dbb567193978" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eaf9afaf30fb7e2ac25989db51" ON "document_chunks"  ("documentId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "agents" ADD "icon" character varying(32)`,
    );
    await queryRunner.query(
      `ALTER TABLE "knowledge_documents" ADD CONSTRAINT "FK_a3adeafc92a4a0cf6da7c5a2a01" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_documents" ADD CONSTRAINT "FK_eae7855687275e4f836ca7255d9" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_documents" ADD CONSTRAINT "FK_37dec937def2652006921c0bd96" FOREIGN KEY ("documentId") REFERENCES "knowledge_documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD CONSTRAINT "FK_eaf9afaf30fb7e2ac25989db51b" FOREIGN KEY ("documentId") REFERENCES "knowledge_documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP CONSTRAINT "FK_eaf9afaf30fb7e2ac25989db51b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_documents" DROP CONSTRAINT "FK_37dec937def2652006921c0bd96"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_documents" DROP CONSTRAINT "FK_eae7855687275e4f836ca7255d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "knowledge_documents" DROP CONSTRAINT "FK_a3adeafc92a4a0cf6da7c5a2a01"`,
    );
    await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN "icon"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eaf9afaf30fb7e2ac25989db51"`,
    );
    await queryRunner.query(`DROP TABLE "document_chunks"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_37dec937def2652006921c0bd9"`,
    );
    await queryRunner.query(`DROP TABLE "agent_documents"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3adeafc92a4a0cf6da7c5a2a0"`,
    );
    await queryRunner.query(`DROP TABLE "knowledge_documents"`);
  }
}
