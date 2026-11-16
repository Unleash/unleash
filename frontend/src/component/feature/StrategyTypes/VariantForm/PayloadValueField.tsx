import React, { Suspense, useState } from 'react';
import {
    type ButtonProps,
    styled,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
} from '@mui/material';
import Input from 'component/common/Input/Input.tsx';
import { SchemaForm } from 'component/common/SchemaForm/SchemaForm.tsx';
import { isPlainObject } from 'component/common/SchemaForm/schemaFormValues.ts';
import type { IPayload } from 'interfaces/featureToggle.ts';
import type { JsonSchemaProperty } from 'interfaces/jsonSchema.ts';

const LazyReactJSONEditor = React.lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor.tsx'),
);

const Field = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

const ValueFieldLabelRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    height: theme.spacing(2.5),
    justifyContent: 'space-between',
    '&[data-with-toggle]': {
        marginBottom: theme.spacing(1),
    },
}));

const FieldLabel = styled('label')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const ValueInput = styled(Input)({
    width: '100%',
    '& textarea': {
        resize: 'vertical',
        fontFamily: 'monospace',
    },
});

const CompactToggleButton = styled(ToggleButton)(({ theme }) => ({
    padding: theme.spacing(0.25, 1),
    lineHeight: 1.5,
}));

const jsonFormValueFor = (
    payload: IPayload,
): Record<string, unknown> | undefined => {
    if (payload.type !== 'json') return undefined;
    if (!payload.value.trim()) return {};
    try {
        const parsed = JSON.parse(payload.value);
        return isPlainObject(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
};

type JsonEditMode = 'form' | 'json';

interface JsonEditModeToggleProps {
    value: JsonEditMode;
    onChange: (value: JsonEditMode) => void;
    formOptionDisabled: boolean;
}

const JsonEditModeToggle = ({
    value,
    onChange,
    formOptionDisabled,
}: JsonEditModeToggleProps) => (
    <ToggleButtonGroup
        size='small'
        color='primary'
        value={value}
        exclusive
        onChange={(_event, next) => {
            if (next !== null) {
                onChange(next);
            }
        }}
    >
        <Tooltip
            arrow
            title={
                formOptionDisabled
                    ? 'The value must be a valid JSON object to edit it as a form'
                    : ''
            }
        >
            <span>
                <CompactToggleButton value='form' disabled={formOptionDisabled}>
                    Form
                </CompactToggleButton>
            </span>
        </Tooltip>
        <CompactToggleButton value='json'>JSON</CompactToggleButton>
    </ToggleButtonGroup>
);

const formatButtonProps: ButtonProps = {
    size: 'small',
    startIcon: null,
    sx: (theme) => ({
        padding: theme.spacing(0, 1),
        minWidth: 0,
        fontSize: theme.typography.body2.fontSize,
    }),
};

interface PayloadValueFieldProps {
    value: IPayload;
    onChange: (payload: IPayload) => void;
    payloadSchema?: JsonSchemaProperty;
    id: string;
    error?: string;
    onBlur: () => void;
}

export const PayloadValueField = ({
    value,
    onChange,
    payloadSchema,
    id,
    error,
    onBlur,
}: PayloadValueFieldProps) => {
    const schemaActive = Boolean(payloadSchema);
    const [jsonEditMode, setJsonEditMode] = useState<JsonEditMode>(
        schemaActive ? 'form' : 'json',
    );

    const jsonFormValue = jsonFormValueFor(value);
    const showJsonEditModeToggle = schemaActive && value.type === 'json';
    const showSchemaForm = Boolean(
        payloadSchema && jsonFormValue && jsonEditMode === 'form',
    );

    return (
        <Field>
            <ValueFieldLabelRow data-with-toggle={showJsonEditModeToggle}>
                <FieldLabel htmlFor={id}>Value</FieldLabel>
                {showJsonEditModeToggle ? (
                    <JsonEditModeToggle
                        value={showSchemaForm ? 'form' : 'json'}
                        onChange={setJsonEditMode}
                        formOptionDisabled={jsonFormValue === undefined}
                    />
                ) : null}
            </ValueFieldLabelRow>
            {showSchemaForm && payloadSchema && jsonFormValue ? (
                <SchemaForm
                    schema={payloadSchema}
                    value={jsonFormValue}
                    onChange={(next) =>
                        onChange({
                            ...value,
                            value: JSON.stringify(next, null, 2),
                        })
                    }
                />
            ) : value.type === 'json' ? (
                <Suspense fallback={null}>
                    <LazyReactJSONEditor
                        content={{ text: value.value }}
                        placeholder='{"cta" : "Start free trial"}'
                        formatButtonProps={formatButtonProps}
                        onChange={(content) => {
                            onChange({
                                ...value,
                                value:
                                    'json' in content
                                        ? JSON.stringify(content.json) || ''
                                        : content.text,
                            });
                        }}
                    />
                </Suspense>
            ) : (
                <ValueInput
                    id={id}
                    label=''
                    multiline
                    minRows={4}
                    maxRows={14}
                    value={value.value}
                    onChange={(e) =>
                        onChange({ ...value, value: e.target.value })
                    }
                    onBlur={onBlur}
                    error={Boolean(error)}
                    errorText={error}
                />
            )}
        </Field>
    );
};
