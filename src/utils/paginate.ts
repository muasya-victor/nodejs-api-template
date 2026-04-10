// src/utils/paginate.ts
export interface PaginateQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export function getPaginationParams(query: PaginateQuery): PaginationParams {
  let page = parseInt(query.page as string);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  let limit = parseInt(query.limit as string);
  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }
  if (limit > 100) {
    limit = 100; 
  }

  const skip = (page - 1) * limit;

  let sortBy = query.sortBy as string;
  if (!sortBy) {
    sortBy = "id";
  }

  let sortOrder = query.sortOrder as string;
  if (sortOrder !== "asc" && sortOrder !== "desc") {
    sortOrder = "desc";
  }

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder: sortOrder as "asc" | "desc",
  };
}
