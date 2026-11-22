import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity({
  name: 'social_accounts',
})
@Unique('UQ_user_id_provider', ['user', 'provider']) // user_id와 provider의 복합 unique 제약 조건
export class SocialAccount {
  @PrimaryGeneratedColumn({ name: 'social_account_id' })
  id: number;

  // ✅ ManyToOne 쪽 (FK 보유자)
  @ManyToOne(() => User, (user) => user.socialAccounts, {
    nullable: false,
    onDelete: 'CASCADE', // User 삭제 시 SocialAccount도 자동 삭제
  })
  @JoinColumn({ name: 'user_id' }) // FK 이름 명시
  user: User;

  @Column({ nullable: false })
  provider: string;

  @Column({ name: 'provider_id', nullable: false })
  providerId: string;
}
