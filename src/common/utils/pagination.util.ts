export interface PaginationOptions {
    page?: number;
    limit?: number;
  }
  
  export const buildPagination = (options: PaginationOptions) => {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
  
    const skip = (page - 1) * limit;
    const take = limit;
  
    return { page, limit, skip, take };
  };
  
  export const buildMeta = (page: number, limit: number, total: number) => {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  };
  