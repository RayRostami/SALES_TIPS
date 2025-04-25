import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({ 
    name: 'vw_company_contract',
    schema: 'public'
})
export class CompanyContractView {
    @ViewColumn()
    id: number;

    @ViewColumn()
    company: string;

    @ViewColumn()
    wholesaler: string;

    @ViewColumn()
    softwarelink: string;

    @ViewColumn()
    softwarename: string;

    @ViewColumn()
    agentid: number;

    @ViewColumn()
    fundservcode: string;

    @ViewColumn()
    statusId: number;

    @ViewColumn()
    status: string;
}
