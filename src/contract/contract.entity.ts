import { Agent } from 'src/agents/agent.entity';
import { Company } from 'src/companies/company.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ContractStatus } from './contractStatus.entity';

@Entity({ schema: 'public', name: 'contract' })
export class Contract {
    @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
    id: number;

    @Column({ name: 'contract_code', type: 'varchar', length: 100, nullable: true })
    contractCode: string;

    @ManyToOne(() => Company, { nullable: false })
    @JoinColumn({ name: 'companyid' })
    company: Company;

    @ManyToOne(() => Agent, { nullable: false })
    @JoinColumn({ name: 'agentid' })
    agent: Agent;

    @ManyToOne(() => ContractStatus, { nullable: false })
    @JoinColumn({ name: 'status' })
    status: ContractStatus;
}
