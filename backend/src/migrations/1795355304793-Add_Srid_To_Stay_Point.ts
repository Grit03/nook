import { MigrationInterface, QueryRunner } from 'typeorm';

// stays.point 컬럼에 SRID 0 속성을 붙인다.
// MySQL 8은 SRID 속성이 없는 공간 컬럼의 SPATIAL INDEX를 옵티마이저가 쓰지 않아,
// 영역 검색(MBRContains)이 전체 스캔으로 동작했다.
// 기존 값은 모두 ST_PointFromText의 기본 SRID(0)로 저장돼 있어 그대로 변경할 수 있다.
// 공간 인덱스가 걸린 컬럼은 SRID를 바꿀 수 없어서, 인덱스를 지웠다가 다시 만든다.
// (TypeORM MySQL 드라이버는 엔티티의 srid 옵션을 DDL에 반영하지 않아 직접 작성한 마이그레이션이다.)
export class AddSridToStayPoint1795355304793 implements MigrationInterface {
  name = 'AddSridToStayPoint1795355304793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_a72922412833a00d86eda74d4b\` ON \`stays\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stays\` MODIFY \`point\` point NOT NULL SRID 0`,
    );
    await queryRunner.query(
      `CREATE SPATIAL INDEX \`IDX_a72922412833a00d86eda74d4b\` ON \`stays\` (\`point\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_a72922412833a00d86eda74d4b\` ON \`stays\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stays\` MODIFY \`point\` point NOT NULL`,
    );
    await queryRunner.query(
      `CREATE SPATIAL INDEX \`IDX_a72922412833a00d86eda74d4b\` ON \`stays\` (\`point\`)`,
    );
  }
}
