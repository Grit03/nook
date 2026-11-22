import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameConstraintsAfterStayBookingRename1795355844879 implements MigrationInterface {
    name = 'RenameConstraintsAfterStayBookingRename1795355844879'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`stays\` DROP FOREIGN KEY \`FK_b274b7d087f750d42785ea0c48b\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_9ed5ff4942e09edfd44ee0ccf01\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_390b1645ff9e4ebdf34029e0844\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_4af5055a871c46d011345a255a6\``);
        await queryRunner.query(`DROP INDEX \`IDX_a72922412833a00d86eda74d4b\` ON \`stays\``);
        await queryRunner.query(`DROP INDEX \`REL_9ed5ff4942e09edfd44ee0ccf0\` ON \`payments\``);
        await queryRunner.query(`CREATE SPATIAL INDEX \`IDX_872d85ee711e882251688ed63a\` ON \`stays\` (\`point\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_e86edf76dc2424f123b9023a2b\` ON \`payments\` (\`booking_id\`)`);
        await queryRunner.query(`ALTER TABLE \`stays\` ADD CONSTRAINT \`FK_8e2008a01aa6fed484d42907bc2\` FOREIGN KEY (\`host_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_e86edf76dc2424f123b9023a2b2\` FOREIGN KEY (\`booking_id\`) REFERENCES \`bookings\`(\`booking_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_e16ca7785a9a5beff045fa805f3\` FOREIGN KEY (\`stay_id\`) REFERENCES \`stays\`(\`stay_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_64cd97487c5c42806458ab5520c\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_64cd97487c5c42806458ab5520c\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_e16ca7785a9a5beff045fa805f3\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_e86edf76dc2424f123b9023a2b2\``);
        await queryRunner.query(`ALTER TABLE \`stays\` DROP FOREIGN KEY \`FK_8e2008a01aa6fed484d42907bc2\``);
        await queryRunner.query(`DROP INDEX \`REL_e86edf76dc2424f123b9023a2b\` ON \`payments\``);
        await queryRunner.query(`DROP INDEX \`IDX_872d85ee711e882251688ed63a\` ON \`stays\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_9ed5ff4942e09edfd44ee0ccf0\` ON \`payments\` (\`booking_id\`)`);
        await queryRunner.query(`CREATE SPATIAL INDEX \`IDX_a72922412833a00d86eda74d4b\` ON \`stays\` (\`point\`)`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_4af5055a871c46d011345a255a6\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_390b1645ff9e4ebdf34029e0844\` FOREIGN KEY (\`stay_id\`) REFERENCES \`stays\`(\`stay_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_9ed5ff4942e09edfd44ee0ccf01\` FOREIGN KEY (\`booking_id\`) REFERENCES \`bookings\`(\`booking_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stays\` ADD CONSTRAINT \`FK_b274b7d087f750d42785ea0c48b\` FOREIGN KEY (\`host_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
