import { Booking } from 'src/booking/booking.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({
  name: 'payments',
})
@Unique('UQ_booking_id', ['booking'])
export class Payment {
  @PrimaryGeneratedColumn({ name: 'payment_id' })
  id: number;

  @OneToOne(() => Booking, (booking) => booking.payment)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ nullable: false })
  method: number;

  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  status: 'PAID' | 'FAILED' | 'CANCELLED';

  @Column({ name: 'pg_tid', type: 'varchar', nullable: false })
  pgTid: string;

  @Column({ name: 'paid_at', type: 'datetime', nullable: false })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', nullable: false })
  createdAt: Date;
}
