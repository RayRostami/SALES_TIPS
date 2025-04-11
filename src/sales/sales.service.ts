// src/sales/sales.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, SelectQueryBuilder } from 'typeorm';
import { Sale } from './sales.entity';
import { CreateSaleDto, UpdateSaleDto, SaleSearchParams } from './create-sale-dto';

import { DataSource } from 'typeorm';


@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>, private dataSource: DataSource
  ) { }

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
   
    const values = [
      new Date(createSaleDto.salesDate),
      createSaleDto.salesAmount,
      createSaleDto.productId,
      createSaleDto.companyId,
      createSaleDto.agentId,
      createSaleDto.payStatusId,
      createSaleDto.clientName,
      createSaleDto.policyNum,
      createSaleDto.note,
      createSaleDto.coverage,
      createSaleDto.commission,
      createSaleDto.fyc
    ];
    const query = `
      INSERT INTO "sale" 
      ("salesDate", "salesAmount", "productId", "companyId", "agentId", "pay_status_id","client_name","policy_num", "note", "coverage","commission","fyc)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11,$12)
    `;

    // Using QueryRunner for direct SQL execution
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const result = await queryRunner.query(query, values);

      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll({
    page = 1,
    pageSize = 10,
    sortField,
    sortOrder
  }) {
    const skip = (page - 1) * pageSize;
    const order: any = {};

    if (sortField) {
      // Handle nested sorting (e.g., 'agent.firstName')
      if (sortField.includes('.')) {
        const [relation, field] = sortField.split('.');
        order[relation] = { [field]: sortOrder || 'ASC' };
      } else {
        order[sortField] = sortOrder || 'ASC';
      }
    }

    const [data, total] = await this.saleRepository.findAndCount({
      relations: ['agent', 'product', 'company', 'payStatus'],
      order,
      skip,
      take: pageSize,
    });

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async search(params: SaleSearchParams) {
    const baseQueryBuilder = this.saleRepository
      .createQueryBuilder('sale');

     
    // Apply all filters to a function that returns the modified query builder
    const applyFilters = (qb: SelectQueryBuilder<Sale>) => {
      if (params.agentId) {
        qb.andWhere('sale.agentId = :agentId', { agentId: params.agentId });
      }
      if (params.payStatusId) {
        qb.andWhere('sale.pay_status_id = :payStatusId', { payStatusId: params.payStatusId });
      }
      if (params.productId) {
        qb.andWhere('sale.productId = :productId', { productId: params.productId });
      }
      if (params.companyId) {
        qb.andWhere('sale.companyId = :companyId', { companyId: params.companyId });
      }
      if (params.clientName) {
        qb.andWhere("LOWER(sale.client_name) LIKE LOWER(:clientName)", {
          clientName: `%${params.clientName}%`
        });
      }
      if (params.policyNum) {
        qb.andWhere("LOWER(sale.policy_num) LIKE LOWER(:policyNum)", {
          policyNum: `%${params.policyNum}%`
        });
      }
      if (params.fromDate && params.toDate) {
        qb.andWhere('sale.salesDate BETWEEN :fromDate AND :toDate', {
          fromDate: params.fromDate,
          toDate: params.toDate,
        });
      } else if (params.fromDate) {
        qb.andWhere('sale.salesDate >= :fromDate', { fromDate: params.fromDate });
      } else if (params.toDate) {
        qb.andWhere('sale.salesDate <= :toDate', { toDate: params.toDate });
      }
      return qb;
    };

    // Apply filters to base query
    const filteredQuery = applyFilters(baseQueryBuilder);

    // Create data query with relations and ordering
    const dataQuery = filteredQuery.clone()
      .leftJoinAndSelect('sale.agent', 'agent')
      .leftJoinAndSelect('sale.product', 'product')
      .leftJoinAndSelect('sale.company', 'company')
      .leftJoinAndSelect('sale.payStatus', 'payStatus');

    // Apply sorting
    if (params.sortField) {
      const order: any = {};
      if (params.sortField.includes('.')) {
        const [relation, field] = params.sortField.split('.');
        order[relation] = { [field]: params.sortOrder || 'ASC' };
      } else {
        order[params.sortField] = params.sortOrder || 'ASC';
      }

      for (const [key, value] of Object.entries(order)) {
        if (typeof value === 'object') {
          const obj = value as object;
          const [nestedKey, nestedValue] = Object.entries(obj)[0];
          dataQuery.addOrderBy(`${key}.${nestedKey}`, nestedValue === 'DESC' ? 'DESC' : 'ASC');
        } else {
          dataQuery.addOrderBy(`sale.${key}`, value === 'DESC' ? 'DESC' : 'ASC');
        }
      }
    }
    
    // Only apply pagination if page and pageSize are provided
    if (params.page && params.pageSize) {
      const skip = (params.page - 1) * params.pageSize;
      dataQuery.skip(skip).take(params.pageSize);
    }
    

    // Create total amount query from the filtered base query
    const totalAmountQuery = filteredQuery.clone()
    .andWhere('sale.productId <=4 ')
    .select('SUM(sale.salesAmount)', 'total');

    const totalCommissionQuery = filteredQuery.clone()
    .select('SUM(sale.commission)', 'total');
    
    const totalDisabilityQuery = filteredQuery.clone()
    .andWhere('sale.productId = 5 ')
    .select('SUM(sale.salesAmount)', 'total');

    const totalInvesmentQuery = filteredQuery.clone()
    .andWhere('sale.productId = 6 ')
    .select('SUM(sale.salesAmount)', 'total');

    const totalTravelQuery = filteredQuery.clone()
    .andWhere('sale.productId = 7 ')
    .select('SUM(sale.salesAmount)', 'total');
    
      const totalGroupDentalQuery = filteredQuery.clone()
      .andWhere('sale.productId in (8,9) ')
      .select('SUM(sale.salesAmount)', 'total');
      
    // Execute queries
    const [data, total] = await dataQuery.getManyAndCount();
    const totalAmount = await totalAmountQuery.getRawOne();
    const totalInvesment = await totalInvesmentQuery.getRawOne();
    const totalTravel = await totalTravelQuery.getRawOne();
    const totalDisability = await totalDisabilityQuery.getRawOne();
    const totalGroupDental = await totalGroupDentalQuery.getRawOne();
    const totalCommission = await totalCommissionQuery.getRawOne();
    return {
      data,
      total,
      totalSales: Number(totalAmount?.total || 0),
      totalDisability: Number(totalDisability?.total || 0),
      totalInvesment: Number(totalInvesment?.total || 0),
      totalTravel: Number(totalTravel?.total || 0),  
      totalGroupDental: Number(totalGroupDental?.total || 0),  
      totalCommission: Number(totalCommission?.total || 0),
      totalRecords: data.length, 
      page: params.page || 1,
      pageSize: params.pageSize || data.length,
    };
  }


  async findOne(id: number): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['agent', 'product', 'company', 'payStatus'],
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.findOne(id);
    // Create relations objects
    const relations = {
      agent: updateSaleDto.agentId ? { id: updateSaleDto.agentId } : undefined,
      product: updateSaleDto.productId ? { id: updateSaleDto.productId } : undefined,
      company: updateSaleDto.companyId ? { id: updateSaleDto.companyId } : undefined,
      payStatus: updateSaleDto.payStatusId ? { id: updateSaleDto.payStatusId } : undefined,
    };

    // Merge the DTO with relations
    const updatedSale = {
      ...updateSaleDto,
      ...relations
    };

    // Remove the ID fields as they're now in the relations
    delete updatedSale.agentId;
    delete updatedSale.productId;
    delete updatedSale.companyId;
    delete updatedSale.payStatusId;

    // Assign the updated values
    Object.assign(sale, updatedSale);
    return await this.saleRepository.save(sale);
  }

  async remove(id: number): Promise<void> {
    const result = await this.saleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
  }
}
