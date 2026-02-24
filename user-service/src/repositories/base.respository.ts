import { PrismaAdapter } from "../../../utils/src/index.js";

export class BaseRepository<TModel, TCreate, TUpdate, TWhere> {
  constructor(protected adapter: PrismaAdapter<TModel, TCreate, TUpdate, TWhere>) {}

  create(data: TCreate) {
    return this.adapter.create(data);
  }

  createMany(data: TCreate[]) {
    return this.adapter.createMany(data);
  }

  findById(id: string) {
    return this.adapter.findById(id);
  }

  findOne(where: TWhere) {
    return this.adapter.findOne(where);
  }

  findMany(where: TWhere) {
    return this.adapter.findMany(where);
  }

  update(id: string, data: TUpdate) {
    return this.adapter.update(id, data);
  }

  delete(id: string) {
    return this.adapter.delete(id);
  }

  deleteMany(where: TWhere) {
    return this.adapter.deleteMany(where);
  }

  count(where: TWhere) {
    return this.adapter.count(where);
  }

  async transaction<R>(fn: (repo: this) => Promise<R>): Promise<R> {
    return fn(this);
  }
}
