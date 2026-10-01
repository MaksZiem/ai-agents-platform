import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1790891142624 implements MigrationInterface {
  name = 'Init1790891142624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."agents_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."agents_provider_enum" AS ENUM('GEMINI')`,
    );
    await queryRunner.query(
      `CREATE TABLE "agents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "instructions" text NOT NULL, "status" "public"."agents_status_enum" NOT NULL DEFAULT 'ACTIVE', "provider" "public"."agents_provider_enum" NOT NULL DEFAULT 'GEMINI', "model" character varying NOT NULL, "temperature" real NOT NULL DEFAULT '0.7', "maxOutputTokens" integer NOT NULL DEFAULT '2048', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9c653f28ae19c5884d5baf6a1d9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "agents"`);
    await queryRunner.query(`DROP TYPE "public"."agents_provider_enum"`);
    await queryRunner.query(`DROP TYPE "public"."agents_status_enum"`);
  }
}
