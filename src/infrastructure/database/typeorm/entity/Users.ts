import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 120 })
  name: string

  @Column({ length: 150 })
  email: string

  password?: string

  @Column({
    type: 'enum',
    enum: ['admin', 'comun'],
    default: 'comum',
  })
  role: string

  @Column({ type: 'boolean', default: false })
  isOnboarded: boolean

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  deletedAt: Date
}
