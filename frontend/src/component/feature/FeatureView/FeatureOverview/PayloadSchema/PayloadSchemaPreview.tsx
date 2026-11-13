import { useState } from 'react';
import { styled, Typography } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import type { JsonSchemaProperty } from 'interfaces/jsonSchema';
import { SchemaForm } from 'component/common/SchemaForm/SchemaForm.tsx';
import { formValueWithExamplesAsDefaults } from './previewSchema.ts';
import { isObjectSchema } from 'component/common/SchemaForm/schemaMatchers.ts';

type ObjectSchema = JsonSchemaProperty & { type: 'object' };

const StyledPreview = styled('div')(({ theme }) => ({
    height: '100%',
    overflowY: 'auto',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledEmpty = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

interface IPayloadSchemaPreviewProps {
    schema: unknown;
}

const PreviewFallback = ({ message }: { message: string }) => (
    <StyledPreview>
        <StyledEmpty>{message}</StyledEmpty>
    </StyledPreview>
);

const SchemaPreviewForm = ({ schema }: { schema: ObjectSchema }) => {
    const [value, setValue] = useState<Record<string, unknown>>(() =>
        formValueWithExamplesAsDefaults(schema),
    );

    return (
        <StyledPreview>
            <SchemaForm schema={schema} value={value} onChange={setValue} />
        </StyledPreview>
    );
};

export const PayloadSchemaPreview = ({
    schema,
}: IPayloadSchemaPreviewProps) => {
    if (!isObjectSchema(schema)) {
        return (
            <PreviewFallback message='Write a valid JSON Schema to see a preview of the resulting form.' />
        );
    }

    return (
        <ErrorBoundary
            resetKeys={[schema]}
            fallbackRender={() => (
                <PreviewFallback message="This schema can't be rendered as a form yet." />
            )}
        >
            <SchemaPreviewForm key={JSON.stringify(schema)} schema={schema} />
        </ErrorBoundary>
    );
};
