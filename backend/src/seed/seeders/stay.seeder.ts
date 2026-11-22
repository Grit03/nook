import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { fakerKO as faker } from '@faker-js/faker';
import { Stay } from 'src/stay/stay.entity';
import { generateStayName } from './stay-name';
import { generateStayAddress } from './stay-address';
import { randomPointInSouthKorea } from './korea-land';

@Injectable()
export class StaySeeder {
  constructor(
    @InjectRepository(Stay)
    private readonly stayRepository: Repository<Stay>,
  ) {}

  async clear() {
    console.log('🗑️ 모든 숙소를 삭제합니다...');
    await this.stayRepository.createQueryBuilder().delete().execute();
    console.log('✅ 모든 숙소를 삭제했습니다.');
  }

  async seed({
    userIds,
    size = 1000,
  }: {
    userIds: ObjectLiteral[];
    size?: number;
  }): Promise<{ id: number }[]> {
    if (!userIds) throw new Error('FK로 참조할 유저 ID가 없습니다.');

    console.log(`🌱 ${size}개의 숙소를 시딩(seeding) 중...`);

    const stays: any[] = [];

    for (let i = 0; i < size; i++) {
      // 대한민국 육지 안(바다·북한·해외 제외)의 좌표만 사용
      const [lon, lat] = randomPointInSouthKorea();

      stays.push({
        host: faker.helpers.arrayElement(userIds),
        name: generateStayName(),
        address: generateStayAddress(lon, lat),
        // ST_PointFromText를 직접 사용 (함수로 감싸기)
        point: () => `ST_PointFromText('POINT(${lon} ${lat})')`,
        rating: faker.number.float({ min: 0.0, max: 5.0, fractionDigits: 2 }),
        pricePerDay: faker.number.int({
          min: 10000,
          max: 1000000,
          multipleOf: 1000,
        }),
        maxGuests: faker.number.int({
          min: 1,
          max: 10,
        }),
        imageUrl: faker.image.url({ width: 330, height: 200 }),
      });
    }

    // QueryBuilder를 사용하여 insert
    const result = await this.stayRepository
      .createQueryBuilder()
      .insert()
      .into(Stay)
      .values(stays)
      .execute();

    console.log(
      `✅ ${result.identifiers.length}개의 숙소를 시딩(seeding) 했습니다.`,
    );
    return result.identifiers as { id: number }[];
  }
}
