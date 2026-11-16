import React, { Suspense, useState } from 'react';
import {
    type ButtonProps,
    styled,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import Input from 'component/common/Input/Input.tsx';
import type { IPayload } from 'interfaces/featureToggle.ts';

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

const SchemaFormPlaceholder = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5),
    border: `1px dashed ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

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
    schemaActive: boolean;
    id: string;
    error?: string;
    onBlur: () => void;
}

type JsonEditMode = 'form' | 'json';

export const PayloadValueField = ({
    value,
    onChange,
    schemaActive,
    id,
    error,
    onBlur,
}: PayloadValueFieldProps) => {
    const [jsonEditMode, setJsonEditMode] = useState<JsonEditMode>(
        schemaActive ? 'form' : 'json',
    );
    const showJsonEditModeToggle = schemaActive && value.type === 'json';

    return (
        <Field>
            <ValueFieldLabelRow data-with-toggle={showJsonEditModeToggle}>
                <FieldLabel htmlFor={id}>Value</FieldLabel>
                {showJsonEditModeToggle ? (
                    <ToggleButtonGroup
                        size='small'
                        color='primary'
                        value={jsonEditMode}
                        exclusive
                        onChange={(_event, value) => {
                            if (value !== null) {
                                setJsonEditMode(value);
                            }
                        }}
                    >
                        <CompactToggleButton value='form'>
                            Form
                        </CompactToggleButton>
                        <CompactToggleButton value='json'>
                            JSON
                        </CompactToggleButton>
                    </ToggleButtonGroup>
                ) : null}
            </ValueFieldLabelRow>
            {value.type === 'json' &&
            jsonEditMode === 'form' &&
            schemaActive ? (
                <SchemaFormPlaceholder>
                    Schema-based form — coming soon.
                </SchemaFormPlaceholder>
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
