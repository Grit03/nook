import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { SocialAccount } from 'src/social_account/social_account.entity';
import { Stay } from 'src/stay/stay.entity';
import { Booking } from 'src/booking/booking.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password?: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  // 실제 데이터베이스 컬럼이 생성되지 않는다.
  // @OneToMany는 오직 "논리적 관계를 표현"하는 역할만 합니다.
  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user, {
    nullable: true,
  })
  socialAccounts?: SocialAccount[];

  @OneToMany(() => Stay, (stay) => stay.host, {
    nullable: true,
  })
  stays?: Stay[];

  @OneToMany(() => Booking, (booking) => booking.user, {
    nullable: true,
  })
  bookings?: Booking[];

  @CreateDateColumn({ name: 'created_at', type: 'datetime', nullable: false })
  createdAt: Date;
}
