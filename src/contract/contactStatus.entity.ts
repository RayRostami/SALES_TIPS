import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'public', name: 'contractstatus' })
export class ContractStatus {
    @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
    id: number;

    @Column({ name: 'code', type: 'varchar', length: 50 })
    code: string;
}