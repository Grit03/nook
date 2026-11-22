import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { fakerKO as faker } from '@faker-js/faker';
import { User } from 'src/user/user.entity';
import { hash } from 'argon2';
import { UniqueEnforcer } from 'enforce-unique';

// 글로벌 스코프에서 UniqueEnforcer 생성 - 모든 배치에서 고유성 보장
const uniqueEnforcer = new UniqueEnforcer();

interface UserSeedData {
  email: string;
  password: string;
  name: string;
}

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async clear() {
    console.log('🗑️ 모든 유저를 삭제합니다...');
    await this.userRepository.createQueryBuilder().delete().execute();
    console.log('✅ 모든 유저를 삭제했습니다.');
  }

  // 고유한 이메일을 생성하는 헬퍼 함수 (충돌 시 재시도)
  private generateUniqueEmail(): string {
    let maxRetries = 100; // 무한 루프 방지

    while (maxRetries > 0) {
      try {
        const email = faker.internet.email().toLowerCase();
        return uniqueEnforcer.enforce(email);
      } catch {
        // EnforceUniqueError 발생 시 다시 시도
        maxRetries--;
        if (maxRetries === 0) {
          throw new Error(
            '고유한 이메일 생성에 실패했습니다. 재시도 횟수 초과',
          );
        }
      }
    }
    throw new Error('고유한 이메일 생성에 실패했습니다.');
  }

  async seed(size = 1000): Promise<ObjectLiteral[]> {
    console.log(`🌱 ${size}명의 유저를 시딩(seeding) 중...`);

    const hashedPassword = await hash('password123');
    const users: UserSeedData[] = [];

    for (let i = 0; i < size; i++) {
      const user: UserSeedData = {
        email: this.generateUniqueEmail(),
        password: hashedPassword,
        name: faker.person.fullName(),
      };
      users.push(user);
    }

    const result = await this.userRepository.insert(users);
    console.log(
      `✅ ${result.identifiers.length}명의 유저를 시딩(seeding) 했습니다.`,
    );
    return result.identifiers;
  }
}
