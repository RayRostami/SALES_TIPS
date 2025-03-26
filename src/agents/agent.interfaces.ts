import { Agent } from "./agent.entity";

export interface PaginatedAgents {
  items: Agent[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
  
  export interface QueryParams {
    skip: number;
    take: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }

  export default PaginatedAgents;
