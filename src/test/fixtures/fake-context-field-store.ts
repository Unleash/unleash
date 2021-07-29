import {
    IContextField,
    IContextFieldDto,
    IContextFieldStore,
} from '../../lib/types/stores/context-field-store';
import NotFoundError from '../../lib/error/notfound-error';

export default class FakeContextFieldStore implements IContextFieldStore {
    defaultContextFields: IContextField[] = [
        {
            name: 'environment',
            createdAt: new Date(),
            description: 'Environment',
            sortOrder: 0,
            stickiness: true,
        },
        {
            name: 'userId',
            createdAt: new Date(),
            description: 'Environment',
            sortOrder: 0,
            stickiness: true,
        },
        {
            name: 'appName',
            createdAt: new Date(),
            description: 'Environment',
            sortOrder: 0,
            stickiness: true,
        },
    ];

    contextFields: IContextField[] = this.defaultContextFields;

    async create(data: IContextFieldDto): Promise<IContextField> {
        const cF: IContextField = { createdAt: new Date(), ...data };
        this.contextFields.push(cF);
        return cF;
    }

    async delete(key: string): Promise<void> {
        this.contextFields.splice(
            this.contextFields.findIndex((cF) => cF.name === key),
            1,
        );
    }

    async deleteAll(): Promise<void> {
        this.contextFields = this.defaultContextFields;
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        return this.contextFields.some((cF) => cF.name === key);
    }

    async get(key: string): Promise<IContextField> {
        const contextField = this.contextFields.find((cF) => cF.name === key);
        if (contextField) {
            return contextField;
        }
        throw new NotFoundError(
            `Could not find contextField with name : ${key}`,
        );
    }

    async getAll(): Promise<IContextField[]> {
        return this.contextFields;
    }

    async update(data: IContextFieldDto): Promise<IContextField> {
        await this.delete(data.name);
        return this.create(data);
    }
}
