import type { ReactNode } from 'react';
import { styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import { parseDateValue, parseValidDate } from 'component/common/util.ts';
import {
    isDateTimeSchema,
    isPlainStringOrNumberSchema,
    type SchemaMatcher,
} from './schemaMatchers.ts';
import type { JsonSchemaProperty } from './payloadSchemaTypes.ts';

const StyledUnsupported = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5),
    border: `1px dashed ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

const toDateTimeInputValue = (value: unknown): string =>
    typeof value === 'string' && parseValidDate(value)
        ? parseDateValue(value)
        : '';

const fromDateTimeInputValue = (input: string): string =>
    parseValidDate(input)?.toISOString() ?? input;

const htmlInputType = (schema: JsonSchemaProperty): string => {
    if (schema.type === 'number' || schema.type === 'integer') return 'number';
    if (schema.format === 'uri') return 'url';
    return 'text';
};

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

    const renderers: {
        matches: SchemaMatcher;
        render: () => ReactNode;
    }[] = [
        {
            matches: isDateTimeSchema,
            render: () => (
                <Input
                    label={label}
                    description={schema.description}
                    required={required}
                    disabled={Boolean(schema.readOnly)}
                    type='datetime-local'
                    value={toDateTimeInputValue(value)}
                    onChange={(event) =>
                        onChange(fromDateTimeInputValue(event.target.value))
                    }
                    fullWidth
                />
            ),
        },
        {
            matches: isPlainStringOrNumberSchema,
            render: () => (
                <Input
                    label={label}
                    description={schema.description}
                    required={required}
                    disabled={Boolean(schema.readOnly)}
                    type={htmlInputType(schema)}
                    value={(value as string | number) ?? ''}
                    onChange={(event) => onChange(event.target.value)}
                    fullWidth
                    slotProps={{
                        htmlInput: {
                            min: schema.minimum,
                            max: schema.maximum,
                            step: schema.multipleOf,
                            minLength: schema.minLength,
                            maxLength: schema.maxLength,
                            pattern: schema.pattern,
                        },
                    }}
                />
            ),
        },
    ];

    const strategy = renderers.find(({ matches }) => matches(schema));

    if (!strategy) {
        return (
            <StyledUnsupported>
                <strong>{label}:</strong> not supported in a form view.
            </StyledUnsupported>
        );
    }

    return strategy.render();
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
