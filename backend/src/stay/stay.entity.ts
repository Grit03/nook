import { Booking } from 'src/booking/booking.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';

const pointTransformer: ValueTransformer = {
  to(value: [number, number]) {
    if (!value) return null;
    // [lon, lat] → 'POINT(lon lat)' 문자열로 변환
    return `POINT(${value[0]} ${value[1]})`;
  },
  from(value: Buffer | string) {
    if (!value) return null;
    // DB → 문자열 형태로 들어오므로 좌표 추출
    const regex = /^POINT\(([-\d.]+) ([-\d.]+)\)$/;
    const match =
      typeof value === 'string'
        ? value.match(regex)
        : value.toString().match(regex);
    if (match) {
      return [Number(match[1]), Number(match[2])] as [number, number];
    }
    return null;
  },
};

@Entity({
  name: 'stays',
})
export class Stay {
  @PrimaryGeneratedColumn({ name: 'stay_id' })
  id: number;

  @ManyToOne(() => User, (user) => user.stays, { nullable: false })
  @JoinColumn({ name: 'host_id' }) // 현재 테이블의 FK 컬럼 이름
  host: User;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  address: string;

  // DB 컬럼은 `point NOT NULL SRID 0` (마이그레이션 AddSridToStayPoint).
  // SRID 속성이 있어야 MySQL 8 옵티마이저가 공간 인덱스를 쓴다.
  // TypeORM MySQL 드라이버는 srid 옵션을 DDL에 반영하지 않으므로,
  // 이 컬럼을 다시 만드는 마이그레이션을 생성하면 SRID 0을 직접 붙여야 한다.
  @Column({ type: 'point', srid: 0, transformer: pointTransformer })
  @Index({ spatial: true })
  point: [number, number];

  @Column({ type: 'double', nullable: false })
  rating: number;

  @Column({ name: 'price_per_day', type: 'int', nullable: false })
  pricePerDay: number;

  @Column({ name: 'max_guests', type: 'int', nullable: false })
  maxGuests: number;

  @Column({ name: 'image_url', nullable: false })
  imageUrl: string;

  @OneToMany(() => Booking, (booking) => booking.stay, {
    nullable: true,
  })
  bookings?: Booking[];
}
