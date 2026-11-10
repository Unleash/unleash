import Input from 'component/common/Input/Input';
import type { JsonSchemaProperty } from './payloadSchemaTypes.ts';

interface ISchemaFormFieldProps {
    name: string;
    schema: JsonSchemaProperty;
    value: unknown;
    onChange: (value: unknown) => void;
    required?: boolean;
}

const SchemaFormField = ({
    name,
    schema,
    value,
    onChange,
    required,
}: ISchemaFormFieldProps) => {
    const label = schema.title ?? name;

    return (
        <Input
            label={label}
            description={schema.description}
            required={required}
            value={(value as string | number) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            fullWidth
        />
    );
};

interface ISchemaFormFieldsProps {
    schema: JsonSchemaProperty;
    value: Record<string, unknown>;
    onChange: (value: Record<string, unknown>) => void;
}

export const SchemaForm = ({
    schema,
    value,
    onChange,
}: ISchemaFormFieldsProps) => {
    return (
        <>
            {Object.entries(schema.properties ?? {}).map(
                ([propName, propSchema]) => (
                    <SchemaFormField
                        key={propName}
                        name={propName}
                        schema={propSchema}
                        value={value[propName]}
                        required={schema.required?.includes(propName)}
                        onChange={(next) =>
                            onChange({ ...value, [propName]: next })
                        }
                    />
                ),
            )}
        </>
    );
};
