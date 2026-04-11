import { prisma } from "@/config/prisma.js";
import { getPaginationParams } from "@/utils/paginate.js";

export class BaseRepository {
  protected model: any;

  constructor(model: any) {
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
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async findAll() {
    return await this.model.findMany();
  }

  async findById(id: number) {
    return await this.model.findUnique({ where: { id } });
  }

  async create(data: any) {
    return await this.model.create({ data });
  }

  async update(id: number, data: any) {
    return await this.model.update({ where: { id }, data });
  }

  async delete(id: number) {
    return await this.model.delete({ where: { id } });
  }
}
