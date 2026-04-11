// src/modules/core/base.repository.ts
import { getPaginationParams } from "@/utils/paginate.js";

type PrismaModel = {
  findMany: (args: any) => Promise<any>;
  findUnique: (args: any) => Promise<any>;
  findFirst: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  count: (args: any) => Promise<number>;
};

export class BaseRepository<T> {
  protected model: PrismaModel;

  constructor(model: PrismaModel) {
    this.model = model;
  }

  async paginate(query: any, options: { where?: any; include?: any } = {}) {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);

    const [data, total] = await Promise.all([
      this.model.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        where: options.where || {},
        include: options.include || {},
      }),
      this.model.count({ where: options.where || {} }),
    ]);

    return {
      data: data as T[],
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async findAll(options: any = {}): Promise<T[]> {
    const data = await this.model.findMany(options);
    return data as T[];
  }

  async findById(id: number): Promise<T | null> {
    const data = await this.model.findUnique({ where: { id } });
    return data as T | null;
  }

  async findOne(where: any): Promise<T | null> {
    const data = await this.model.findFirst({ where });
    return data as T | null;
  }

  // Make create non-generic - use 'any' or specific type
  async create(data: any): Promise<T> {
    const result = await this.model.create({ data });
    return result as T;
  }

  async update(id: number, data: any): Promise<T> {
    const result = await this.model.update({ where: { id }, data });
    return result as T;
  }

  async delete(id: number): Promise<T> {
    const result = await this.model.delete({ where: { id } });
    return result as T;
  }

  async count(where: any = {}): Promise<number> {
    return await this.model.count({ where });
  }
}
