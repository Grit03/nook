import { Stay } from 'src/stay/stay.entity';
import { Payment } from 'src/payment/payment.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({
  name: 'bookings',
})
@Unique('UQ_stay_checkIn_checkOut', [
  'stay',
  'checkIn',
  'checkOut',
])
export class Booking {
  @PrimaryGeneratedColumn({ name: 'booking_id' })
  id: number;

  @ManyToOne(() => Stay, (stay) => stay.bookings)
  @JoinColumn({ name: 'stay_id' })
  stay: Stay;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'check_in', type: 'datetime', nullable: false })
  checkIn: Date;

  @Column({ name: 'check_out', type: 'datetime', nullable: false })
  checkOut: Date;

  @Column({ name: 'num_of_guests', type: 'int', nullable: false })
  numOfGuests: number;

  @Column({ name: 'price_per_day', type: 'int', nullable: false })
  pricePerDay: number;

  @Column({ name: 'total_price', type: 'int', nullable: false })
  totalPrice: number;

  @Column({
    name: 'booking_status',
    type: 'varchar',
    length: 50,
    nullable: false,
    default: 'PENDING',
  })
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    nullable: false,
  })
  createdAt: Date;

  @OneToOne(() => Payment, (payment) => payment.booking, { nullable: true })
  payment?: Payment;
}
