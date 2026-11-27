import { useState } from 'react';
import { styled, Typography } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import type { JsonSchemaProperty } from 'interfaces/jsonSchema';
import { SchemaForm } from 'component/common/SchemaForm/SchemaForm.tsx';
import { formValueWithExamplesAsDefaults } from 'component/common/SchemaForm/schemaFormValues.ts';
import { isStructuredSchema } from 'component/common/SchemaForm/schemaMatchers.ts';
import type { SchemaParseResult } from './schemaParseResult.ts';

const StyledPreview = styled('div')(({ theme }) => ({
    height: '100%',
    overflowY: 'auto',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledEmpty = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

interface IPayloadSchemaPreviewProps {
    parseResult: SchemaParseResult;
}

const PreviewFallback = ({ message }: { message: string }) => (
    <StyledPreview>
        <StyledEmpty>{message}</StyledEmpty>
    </StyledPreview>
);

const UnsupportedSchemaFallback = () => (
    <PreviewFallback message="This schema can't be rendered as a form yet." />
);

const SchemaPreviewForm = ({ schema }: { schema: JsonSchemaProperty }) => {
    const [value, setValue] = useState<unknown>(() =>
        formValueWithExamplesAsDefaults(schema),
    );

    return (
        <StyledPreview>
            <SchemaForm schema={schema} value={value} onChange={setValue} />
        </StyledPreview>
    );
};

export const PayloadSchemaPreview = ({
    parseResult,
}: IPayloadSchemaPreviewProps) => {
    if (parseResult.state === 'empty') {
        return (
            <PreviewFallback message='Write a JSON Schema to see a preview of the resulting form.' />
        );
    }

    if (parseResult.state === 'unparsable') {
        return (
            <PreviewFallback message='Fix the JSON syntax errors to see a preview of the resulting form.' />
        );
    }

    const schema = parseResult.value;
    if (!isStructuredSchema(schema)) {
        return <UnsupportedSchemaFallback />;
    }

    return (
        <ErrorBoundary
            resetKeys={[schema]}
            fallbackRender={UnsupportedSchemaFallback}
        >
            <SchemaPreviewForm key={JSON.stringify(schema)} schema={schema} />
        </ErrorBoundary>
    );
};
