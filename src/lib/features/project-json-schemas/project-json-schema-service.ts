import { Ajv } from 'ajv';
import type { Logger } from '../../logger.js';
import type { IFlagResolver, IUnleashConfig } from '../../types/index.js';
import type {
    IProjectJsonSchema,
    IProjectJsonSchemaStore,
} from './project-json-schema-store-type.js';
import {
    BadDataError,
    NameExistsError,
    NotFoundError,
} from '../../error/index.js';

interface IProjectJsonSchemaServiceStores {
    projectJsonSchemaStore: IProjectJsonSchemaStore;
}

export default class ProjectJsonSchemaService {
    private logger: Logger;

    private projectJsonSchemaStore: IProjectJsonSchemaStore;

    private flagResolver: IFlagResolver;

    constructor(
        stores: IProjectJsonSchemaServiceStores,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
        this.logger = getLogger(
            'features/project-json-schemas/project-json-schema-service.ts',
        );
        this.projectJsonSchemaStore = stores.projectJsonSchemaStore;
        this.flagResolver = flagResolver;
    }

    async getByProject(projectId: string): Promise<IProjectJsonSchema[]> {
        return this.projectJsonSchemaStore.getByProject(projectId);
    }

    async getById(id: string): Promise<IProjectJsonSchema> {
        const schema = await this.projectJsonSchemaStore.get(id);
        if (!schema) {
            throw new NotFoundError(`Could not find JSON schema with id ${id}`);
        }
        return schema;
    }

    async createSchema(
        projectId: string,
        data: { name: string; schema: Record<string, unknown> },
    ): Promise<IProjectJsonSchema> {
        this.validateJsonSchema(data.schema);

        const existing =
            await this.projectJsonSchemaStore.getByProject(projectId);
        if (existing.some((s) => s.name === data.name)) {
            throw new NameExistsError(
                `A JSON schema named "${data.name}" already exists in this project.`,
            );
        }

        return this.projectJsonSchemaStore.insert({
            project: projectId,
            name: data.name,
            schema: data.schema,
        });
    }

    async updateSchema(
        id: string,
        projectId: string,
        data: { name: string; schema: Record<string, unknown> },
    ): Promise<IProjectJsonSchema> {
        this.validateJsonSchema(data.schema);

        const existing = await this.projectJsonSchemaStore.get(id);
        if (!existing || existing.project !== projectId) {
            throw new NotFoundError(
                `Could not find JSON schema with id ${id} in project ${projectId}`,
            );
        }

        return this.projectJsonSchemaStore.update(id, {
            project: projectId,
            name: data.name,
            schema: data.schema,
        });
    }

    async deleteSchema(id: string, projectId: string): Promise<void> {
        const existing = await this.projectJsonSchemaStore.get(id);
        if (!existing || existing.project !== projectId) {
            throw new NotFoundError(
                `Could not find JSON schema with id ${id} in project ${projectId}`,
            );
        }

        await this.projectJsonSchemaStore.delete(id);
    }

    async validatePayloadAgainstSchema(
        schemaId: string,
        payloadValue: string,
    ): Promise<void> {
        const schemaRecord = await this.projectJsonSchemaStore.get(schemaId);
        if (!schemaRecord) {
            throw new BadDataError(
                `JSON schema with id ${schemaId} does not exist`,
            );
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(payloadValue);
        } catch {
            throw new BadDataError(
                `Variant payload is not valid JSON: ${payloadValue}`,
            );
        }

        const ajv = new Ajv({ allErrors: true });
        // biome-ignore lint/suspicious/noImplicitAnyLet: We need to validate user provided JSON schemas, but type is not known at compile time.
        let validate;
        try {
            validate = ajv.compile(schemaRecord.schema);
        } catch (e: unknown) {
            throw new BadDataError(
                `The referenced JSON schema (${schemaRecord.name}) is invalid and could not be compiled`,
            );
        }

        const valid = validate(parsed);
        if (!valid) {
            const errors = ajv.errorsText(validate.errors);
            throw new BadDataError(
                `Variant payload does not match JSON schema "${schemaRecord.name}": ${errors}`,
            );
        }
    }

    private validateJsonSchema(schema: Record<string, unknown>): void {
        const ajv = new Ajv();
        try {
            ajv.compile(schema);
        } catch (e: unknown) {
            throw new BadDataError(
                `Invalid JSON Schema: ${e instanceof Error ? e.message : String(e)}`,
            );
        }
    }
}
