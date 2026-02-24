export class PrismaAdapter<TModel, TCreate, TUpdate, TWhere> {
  constructor(private model: any) {}

  create(data: TCreate) {
    return this.model.create({ data });
  }

  createMany(data: TCreate[]) {
    return this.model.createMany({ data });
  }

  findById(id: string) {
    return this.model.findUnique({ where: { id } });
  }

  findOne(where: TWhere) {
    return this.model.findFirst({ where });
  }

  findMany(where: TWhere) {
    return this.model.findMany({ where });
  }

  update(id: string, data: TUpdate) {
    return this.model.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.model.delete({ where: { id } });
  }

  deleteMany(where: TWhere) {
    return this.model.deleteMany({ where });
  }

  count(where: TWhere) {
    return this.model.count({ where });
  }
}