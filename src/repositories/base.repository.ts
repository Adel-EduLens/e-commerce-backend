import type { Model, Document } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string, select?: string) {
    const query = this.model.findById(id);
    if (select) query.select(select);
    return query.exec();
  }

  async findOne(filter: Record<string, any>, select?: string) {
    const query = this.model.findOne(filter);
    if (select) query.select(select);
    return query.exec();
  }

  async find(filter: Record<string, any>, select?: string) {
    const query = this.model.find(filter);
    if (select) query.select(select);
    return query.exec();
  }

  async create(data: Partial<T>) {
    return this.model.create(data);
  }

  async updateById(id: string, data: Record<string, any>) {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  async deleteMany(filter: Record<string, any>) {
    return this.model.deleteMany(filter).exec();
  }

  async exists(filter: Record<string, any>) {
    return this.model.exists(filter);
  }
}
