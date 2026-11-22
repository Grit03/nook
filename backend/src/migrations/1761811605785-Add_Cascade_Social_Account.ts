import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeSocialAccount1761811605785 implements MigrationInterface {
    name = 'AddCascadeSocialAccount1761811605785'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`social_accounts\` DROP FOREIGN KEY \`FK_05a0f282d3bed93ca048a7e54dd\``);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` ADD CONSTRAINT \`FK_05a0f282d3bed93ca048a7e54dd\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`social_accounts\` DROP FOREIGN KEY \`FK_05a0f282d3bed93ca048a7e54dd\``);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` ADD CONSTRAINT \`FK_05a0f282d3bed93ca048a7e54dd\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
