import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1761803897863 implements MigrationInterface {
    name = 'InitTables1761803897863'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`social_accounts\` (\`social_account_id\` int NOT NULL AUTO_INCREMENT, \`provider\` varchar(255) NOT NULL, \`provider_id\` varchar(255) NOT NULL, \`user_id\` varchar(36) NOT NULL, UNIQUE INDEX \`UQ_user_id_provider\` (\`user_id\`, \`provider\`), PRIMARY KEY (\`social_account_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payments\` (\`payment_id\` int NOT NULL AUTO_INCREMENT, \`method\` int NOT NULL, \`payment_status\` varchar(50) NOT NULL, \`paid_at\` datetime NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`booking_id\` int NULL, UNIQUE INDEX \`UQ_booking_id\` (\`booking_id\`), UNIQUE INDEX \`REL_9ed5ff4942e09edfd44ee0ccf0\` (\`booking_id\`), PRIMARY KEY (\`payment_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`bookings\` (\`booking_id\` int NOT NULL AUTO_INCREMENT, \`check_in\` datetime NOT NULL, \`check_out\` datetime NOT NULL, \`num_of_guests\` int NOT NULL, \`price_per_day\` int NOT NULL, \`total_price\` int NOT NULL, \`booking_status\` varchar(50) NOT NULL DEFAULT 'PENDING', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`stay_id\` int NULL, \`user_id\` varchar(36) NULL, UNIQUE INDEX \`UQ_stay_checkIn_checkOut\` (\`stay_id\`, \`check_in\`, \`check_out\`), PRIMARY KEY (\`booking_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stays\` (\`stay_id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`point\` point NOT NULL, \`rating\` double NOT NULL, \`image_url\` varchar(255) NOT NULL, \`host_id\` varchar(36) NOT NULL, SPATIAL INDEX \`IDX_a72922412833a00d86eda74d4b\` (\`point\`), PRIMARY KEY (\`stay_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`user_id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NULL, \`name\` varchar(50) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` ADD CONSTRAINT \`FK_05a0f282d3bed93ca048a7e54dd\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_9ed5ff4942e09edfd44ee0ccf01\` FOREIGN KEY (\`booking_id\`) REFERENCES \`bookings\`(\`booking_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_390b1645ff9e4ebdf34029e0844\` FOREIGN KEY (\`stay_id\`) REFERENCES \`stays\`(\`stay_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_4af5055a871c46d011345a255a6\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stays\` ADD CONSTRAINT \`FK_b274b7d087f750d42785ea0c48b\` FOREIGN KEY (\`host_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`stays\` DROP FOREIGN KEY \`FK_b274b7d087f750d42785ea0c48b\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_4af5055a871c46d011345a255a6\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_390b1645ff9e4ebdf34029e0844\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_9ed5ff4942e09edfd44ee0ccf01\``);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` DROP FOREIGN KEY \`FK_05a0f282d3bed93ca048a7e54dd\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_a72922412833a00d86eda74d4b\` ON \`stays\``);
        await queryRunner.query(`DROP TABLE \`stays\``);
        await queryRunner.query(`DROP INDEX \`UQ_stay_checkIn_checkOut\` ON \`bookings\``);
        await queryRunner.query(`DROP TABLE \`bookings\``);
        await queryRunner.query(`DROP INDEX \`REL_9ed5ff4942e09edfd44ee0ccf0\` ON \`payments\``);
        await queryRunner.query(`DROP INDEX \`UQ_booking_id\` ON \`payments\``);
        await queryRunner.query(`DROP TABLE \`payments\``);
        await queryRunner.query(`DROP INDEX \`UQ_user_id_provider\` ON \`social_accounts\``);
        await queryRunner.query(`DROP TABLE \`social_accounts\``);
    }

}
