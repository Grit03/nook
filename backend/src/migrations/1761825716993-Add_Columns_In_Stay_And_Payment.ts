import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsInStayAndPayment1761825716993 implements MigrationInterface {
    name = 'AddColumnsInStayAndPayment1761825716993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payments\` ADD \`pg_tid\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`stays\` ADD \`price_per_day\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`stays\` ADD \`max_guests\` int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`stays\` DROP COLUMN \`max_guests\``);
        await queryRunner.query(`ALTER TABLE \`stays\` DROP COLUMN \`price_per_day\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN \`pg_tid\``);
    }

}
