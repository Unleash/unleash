import React, { Suspense } from 'react';
import { Alert, styled, Typography } from '@mui/material';
import type { InferredPayloadSchemaState } from 'hooks/api/getters/useInferredPayloadSchema/useInferredPayloadSchema';
import { ResponseError } from 'utils/apiUtils';
import { formatUnknownError } from 'utils/formatUnknownError';

const LazyReactJSONEditor = React.lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

const StyledExamples = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    overflowY: 'auto',
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledExample = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.paper,
}));

const hasNonObjectPayloads = (error: Error) =>
    error instanceof ResponseError && error.status === 409;

interface IPayloadSchemaVariantExamplesProps {
    inferred: InferredPayloadSchemaState;
}

export const PayloadSchemaVariantExamples = ({
    inferred,
}: IPayloadSchemaVariantExamplesProps) => {
    if (inferred.status === 'loading') {
        return null;
    }

    return (
        <StyledExamples>
            {inferred.status === 'error' &&
            hasNonObjectPayloads(inferred.error) ? (
                <Alert severity='info'>
                    Examples can only be shown when every JSON variant payload
                    is an object
                </Alert>
            ) : inferred.status === 'error' ? (
                <Alert severity='error'>
                    {formatUnknownError(inferred.error)}
                </Alert>
            ) : !inferred.schema.examples.length ? (
                <Typography variant='body2'>
                    This flag has no JSON variant payloads yet
                </Typography>
            ) : (
                inferred.schema.examples.map((example, index) => (
                    <StyledExample key={JSON.stringify(example)}>
                        <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                            Example {index + 1}
                        </Typography>
                        <Suspense fallback={null}>
                            <LazyReactJSONEditor
                                content={{ json: example }}
                                readOnly
                            />
                        </Suspense>
                    </StyledExample>
                ))
            )}
        </StyledExamples>
    );
};
