import React, { Suspense, useEffect, useState } from 'react';
import { Button, styled, TextField } from '@mui/material';
import type { IProjectJsonSchema } from 'interfaces/jsonSchema';

const LazyReactJSONEditor = React.lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

const StyledForm = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(2),
}));

const StyledTitle = styled('h2')(({ theme }) => ({
    margin: 0,
    marginBottom: theme.spacing(1),
    fontSize: theme.fontSizes.mainHeader,
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
}));

const StyledEditorContainer = styled('div')({
    '& .jse-main': {
        minHeight: 300,
        maxHeight: 500,
    },
});

interface IProjectJsonSchemaModalProps {
    editSchema?: IProjectJsonSchema;
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: { name: string; schema: object }) => void;
    loading: boolean;
}

export const ProjectJsonSchemaModal = ({
    editSchema,
    open,
    onClose,
    onSubmit,
    loading,
}: IProjectJsonSchemaModalProps) => {
    const [name, setName] = useState('');
    const [schemaText, setSchemaText] = useState('{\n  \n}');
    const [nameError, setNameError] = useState('');
    const [schemaError, setSchemaError] = useState('');

    const isEdit = Boolean(editSchema);

    useEffect(() => {
        if (editSchema) {
            setName(editSchema.name);
            setSchemaText(JSON.stringify(editSchema.schema, null, 2));
        } else {
            setName('');
            setSchemaText('{\n  \n}');
        }
        setNameError('');
        setSchemaError('');
    }, [editSchema, open]);

    const validate = (): boolean => {
        let valid = true;

        if (!name.trim()) {
            setNameError('Name is required');
            valid = false;
        } else {
            setNameError('');
        }

        try {
            JSON.parse(schemaText);
            setSchemaError('');
        } catch {
            setSchemaError('Invalid JSON');
            valid = false;
        }

        return valid;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        onSubmit({
            name: name.trim(),
            schema: JSON.parse(schemaText),
        });
    };

    if (!open) return null;

    return (
        <StyledForm>
            <StyledTitle>
                {isEdit ? 'Edit JSON schema' : 'Create JSON schema'}
            </StyledTitle>
            <TextField
                label='Schema name'
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                }}
                error={Boolean(nameError)}
                helperText={nameError}
                autoFocus
                fullWidth
            />
            <div>
                <StyledEditorContainer>
                    <Suspense fallback={null}>
                        <LazyReactJSONEditor
                            content={{ text: schemaText }}
                            onChange={(content) => {
                                if (schemaError) setSchemaError('');
                                if ('text' in content) {
                                    setSchemaText(content.text ?? '');
                                } else if ('json' in content) {
                                    setSchemaText(
                                        JSON.stringify(content.json, null, 2),
                                    );
                                }
                            }}
                        />
                    </Suspense>
                </StyledEditorContainer>
                {schemaError && (
                    <p style={{ color: 'red', marginTop: 4, fontSize: 12 }}>
                        {schemaError}
                    </p>
                )}
            </div>
            <StyledButtonContainer>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {isEdit ? 'Save' : 'Create'}
                </Button>
                <Button onClick={onClose}>Cancel</Button>
            </StyledButtonContainer>
        </StyledForm>
    );
};
