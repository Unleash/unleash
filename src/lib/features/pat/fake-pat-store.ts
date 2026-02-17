import type { IPatStore } from './pat-store-type.js';
import type { CreatePatSchema, PatSchema } from '../../openapi/index.js';
import NotFoundError from '../../error/notfound-error.js';

export default class FakePatStore implements IPatStore {
    private pats: PatSchema[] = [];

    private nextId = 1;

    async create(
        pat: CreatePatSchema,
        secret: string,
        userId: number,
    ): Promise<PatSchema> {
        const newPat: PatSchema = {
            id: this.nextId++,
            description: pat.description,
            expiresAt: pat.expiresAt,
            userId,
            createdAt: new Date().toISOString(),
            seenAt: undefined,
        };
        this.pats.push(newPat);
        return newPat;
    }

    async delete(key: number): Promise<void> {
        this.pats = this.pats.filter((p) => p.id !== key);
    }

    async deleteForUser(id: number, userId: number): Promise<void> {
        this.pats = this.pats.filter(
            (p) => !(p.id === id && p.userId === userId),
        );
    }

    async deleteAll(): Promise<void> {
        this.pats = [];
    }

    destroy(): void {}

    async exists(key: number): Promise<boolean> {
        return this.pats.some((p) => p.id === key);
    }

    async existsWithDescriptionByUser(
        description: string,
        userId: number,
    ): Promise<boolean> {
        return this.pats.some(
            (pat) => pat.description === description && pat.userId === userId,
        );
    }

    async countByUser(userId: number): Promise<number> {
        return this.pats.filter((p) => p.userId === userId).length;
    }

    async get(key: number): Promise<PatSchema> {
        const pat = this.pats.find((p) => p.id === key);
        if (!pat) {
            throw new NotFoundError('No PAT found.');
        }
        return pat;
    }

    async getAll(): Promise<PatSchema[]> {
        return this.pats;
    }

    async getAllByUser(userId: number): Promise<PatSchema[]> {
        return this.pats.filter((p) => p.userId === userId);
    }
}
