import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('surveys')
export class Survey {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @CreateDateColumn()
  created_at: Date;
}
