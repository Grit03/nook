import { Injectable } from '@nestjs/common';
import { UserSeeder } from './user.seeder';
import { StaySeeder } from './stay.seeder';
// import { BookingSeeder } from './booking.seeder';
// import { PaymentSeeder } from './payment.seeder';

@Injectable()
export class DatabaseSeeder {
  constructor(
    private readonly userSeeder: UserSeeder,
    private readonly staySeeder: StaySeeder,
    // private readonly bookingSeeder: BookingSeeder,
    // private readonly paymentSeeder: PaymentSeeder,
  ) {}

  async clearAll() {
    console.log('🗑️  === 모든 데이터를 삭제 ===');
    // await this.paymentSeeder.clear();
    // await this.bookingSeeder.clear();
    await this.staySeeder.clear(); // 자식 테이블 먼저 삭제
    await this.userSeeder.clear(); // 부모 테이블 나중에 삭제
    console.log('✅ === 모든 데이터를 삭제했습니다 ===\n');
  }

  async seedAll({
    repeat,
    batchSize,
  }: {
    repeat?: number;
    batchSize?: number;
  }) {
    const REPEAT = repeat ?? 1;
    const BATCH_SIZE = batchSize ?? 1;

    console.log('🌱 === 데이터베이스 시딩(seeding) 시작 ===');
    console.log(
      `📊 총 개수: ${BATCH_SIZE * REPEAT}, 배치 크기: ${BATCH_SIZE}\n`,
    );

    // 순서가 중요! 의존성 순서대로 실행
    for (let i = 1; i <= REPEAT; i++) {
      console.log(`🔄 ${i} / ${REPEAT} 배치 처리 중...`);
      const userIds = await this.userSeeder.seed(BATCH_SIZE);
      const stayIds = await this.staySeeder.seed({
        userIds,
        // TODO: 인자 값으로 받을 수 있게 수정
        // 유저의 3배의 숙소를 시딩
        size: BATCH_SIZE * 3,
      });
      // await this.bookingSeeder.seed(100);
      // await this.paymentSeeder.seed();
    }

    console.log('\n✅ === 데이터베이스 시딩(seeding) 완료 ===');
  }
}
