"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAdapter = void 0;
class PrismaAdapter {
    constructor(model) {
        this.model = model;
    }
    create(data) {
        return this.model.create({ data });
    }
    createMany(data) {
        return this.model.createMany({ data });
    }
    findById(id) {
        return this.model.findUnique({ where: { id } });
    }
    findOne(where) {
        return this.model.findFirst({ where });
    }
    findMany(where) {
        return this.model.findMany({ where });
    }
    update(id, data) {
        return this.model.update({ where: { id }, data });
    }
    delete(id) {
        return this.model.delete({ where: { id } });
    }
    deleteMany(where) {
        return this.model.deleteMany({ where });
    }
    count(where) {
        return this.model.count({ where });
    }
}
exports.PrismaAdapter = PrismaAdapter;
