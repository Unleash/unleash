import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../types/mutable';

export const createSchemaObject = <T>(schema: T): DeepMutable<T> => {
    return schema;
};

export type CreateSchemaType<T> = FromSchema<
    T,
    {
        deserialize: [
            { pattern: { type: 'string'; format: 'date' }; output: Date },
        ];
    }
>;
