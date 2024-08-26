import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EmployeeStatus {
  KONTRAK = 'kontrak',
  TETAP = 'tetap',
  PROBATION = 'probation',
}

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  no: string;

  @Column()
  position: string;

  @Column()
  department: string;

  @Column({ type: 'date' })
  join_date: Date;

  @Column({ nullable: true })
  photo: string;

  @Column({
    type: process.env.DATABASE_TYPE === 'postgres' ? 'enum' : 'varchar',
    enum: EmployeeStatus
  })
  status: EmployeeStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}