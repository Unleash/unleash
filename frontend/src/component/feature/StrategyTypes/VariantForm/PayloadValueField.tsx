import React, { Suspense, useState } from 'react';
import {
    type ButtonProps,
    Divider,
    styled,
    type Theme,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
} from '@mui/material';
import Input from 'component/common/Input/Input.tsx';
import type { EditorStyle } from 'component/common/ReactJSONEditor/ReactJSONEditor.tsx';
import { SchemaForm } from 'component/common/SchemaForm/SchemaForm.tsx';
import { parseJsonObject } from 'utils/plainObject';
import type { IPayload } from 'interfaces/featureToggle.ts';
import type { JsonSchemaProperty } from 'interfaces/jsonSchema.ts';

const LazyReactJSONEditor = React.lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor.tsx'),
);

const Field = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const fieldLabelStyles = ({ theme }: { theme: Theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
});

const FieldLabel = styled('label')(fieldLabelStyles);
const FieldLabelText = styled('span')(fieldLabelStyles);

const FieldLabelGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1.5),
}));

const FieldLabelHint = styled('span')(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
}));

const PayloadEditorContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1.5),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
}));

const PayloadEditorHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5, 2),
}));

const PayloadEditorBody = styled('div')(({ theme }) => ({
    padding: theme.spacing(2),
}));

const PayloadEditorBox = ({
    header,
    children,
}: {
    header: React.ReactNode;
    children: React.ReactNode;
}) => (
    <Field>
        <PayloadEditorContainer>
            <PayloadEditorHeader>{header}</PayloadEditorHeader>
            <Divider />
            {children}
        </PayloadEditorContainer>
    </Field>
);

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
    return parseJsonObject(payload.value);
};

type JsonEditMode = 'form' | 'json';

interface JsonEditModeToggleProps {
    value: JsonEditMode;
    onChange: (value: JsonEditMode) => void;
    formOptionDisabled?: boolean;
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

interface PayloadJsonEditorProps {
    id: string;
    autoFocus?: boolean;
    value: IPayload;
    onChange: (payload: IPayload) => void;
    editorStyle?: EditorStyle;
}

const PayloadJsonEditor = ({
    id,
    autoFocus,
    value,
    onChange,
    editorStyle,
}: PayloadJsonEditorProps) => (
    <Suspense fallback={null}>
        <LazyReactJSONEditor
            id={id}
            autoFocus={autoFocus}
            content={{ text: value.value }}
            placeholder='{"cta" : "Start free trial"}'
            formatButtonProps={formatButtonProps}
            editorStyle={editorStyle}
            onChange={(text) => {
                onChange({
                    ...value,
                    value: text,
                });
            }}
        />
    </Suspense>
);

interface PayloadValueFieldProps {
    value: IPayload;
    onChange: (payload: IPayload) => void;
    payloadSchema?: JsonSchemaProperty;
    id: string;
    autoFocusJsonEditor?: boolean;
    error?: string;
    onBlur: () => void;
}

export const PayloadValueField = ({
    value,
    onChange,
    payloadSchema,
    id,
    autoFocusJsonEditor,
    error,
    onBlur,
}: PayloadValueFieldProps) => {
    const schemaActive = Boolean(payloadSchema);
    const jsonFormValue = jsonFormValueFor(value);

    const [jsonEditMode, setJsonEditMode] = useState<JsonEditMode>(
        schemaActive ? 'form' : 'json',
    );
    const labelId = `${id}-label`;
    const hintId = `${id}-hint`;

    if (jsonEditMode === 'form' && payloadSchema && jsonFormValue) {
        return (
            <PayloadEditorBox
                header={
                    <>
                        <FieldLabelGroup>
                            <FieldLabelText id={labelId}>Value</FieldLabelText>
                            <FieldLabelHint id={hintId}>
                                Based on the flag's schema
                            </FieldLabelHint>
                        </FieldLabelGroup>
                        <JsonEditModeToggle
                            value='form'
                            onChange={setJsonEditMode}
                        />
                    </>
                }
            >
                <PayloadEditorBody
                    role='group'
                    aria-labelledby={labelId}
                    aria-describedby={hintId}
                >
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
                </PayloadEditorBody>
            </PayloadEditorBox>
        );
    }

    if (schemaActive && value.type === 'json') {
        return (
            <PayloadEditorBox
                header={
                    <>
                        <FieldLabel id={labelId} htmlFor={id}>
                            Value
                        </FieldLabel>
                        <JsonEditModeToggle
                            value='json'
                            onChange={setJsonEditMode}
                            formOptionDisabled={jsonFormValue === undefined}
                        />
                    </>
                }
            >
                <PayloadEditorBody>
                    <PayloadJsonEditor
                        id={id}
                        autoFocus={autoFocusJsonEditor}
                        value={value}
                        onChange={onChange}
                        editorStyle='embedded'
                    />
                </PayloadEditorBody>
            </PayloadEditorBox>
        );
    }

    return (
        <Field>
            <FieldLabel htmlFor={id}>Value</FieldLabel>
            {value.type === 'json' ? (
                <PayloadJsonEditor
                    id={id}
                    autoFocus={autoFocusJsonEditor}
                    value={value}
                    onChange={onChange}
                />
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
