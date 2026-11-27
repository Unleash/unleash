import { useContext, useState } from 'react';
import { Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import AccessContext from 'contexts/AccessContext';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { useUiFlag } from 'hooks/useUiFlag';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { StrategyVariantSchema } from 'openapi';

interface ISuggestPayloadSchemaProps {
    projectId: string;
    variants: StrategyVariantSchema[];
    createSchemaPath: string;
}

export const SuggestPayloadSchema = ({
    projectId,
    variants,
    createSchemaPath,
}: ISuggestPayloadSchemaProps) => {
    const { isEnterprise } = useUiConfig();
    const payloadSchemasEnabled = useUiFlag('payloadSchemas') && isEnterprise();
    const { hasAccess } = useContext(AccessContext);
    const navigate = useNavigate();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const jsonVariantNames = variants
        .filter((variant) => variant.payload?.type === 'json' && variant.name)
        .map((variant) => variant.name);

    if (
        !payloadSchemasEnabled ||
        !hasAccess(UPDATE_FEATURE, projectId) ||
        jsonVariantNames.length === 0
    ) {
        return null;
    }

    const singular = jsonVariantNames.length === 1;

    return (
        <>
            <Alert
                severity='info'
                sx={{ mb: 2, alignItems: 'center' }}
                action={
                    <Button
                        onClick={() => setConfirmOpen(true)}
                        variant='outlined'
                        color='inherit'
                        size='small'
                        sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                        Create schema
                    </Button>
                }
            >
                <strong>
                    {jsonVariantNames.join(', ')}{' '}
                    {singular ? 'uses a JSON payload' : 'use JSON payloads'}{' '}
                    without validation.
                </strong>{' '}
                Create a schema from {singular ? 'it' : 'them'} to catch errors
                and edit variant payloads with a form.
            </Alert>

            <Dialogue
                open={confirmOpen}
                title='Leave the strategy form?'
                onClick={() => navigate(createSchemaPath)}
                onClose={() => setConfirmOpen(false)}
            >
                Unsaved changes to this strategy will be lost.
            </Dialogue>
        </>
    );
};
