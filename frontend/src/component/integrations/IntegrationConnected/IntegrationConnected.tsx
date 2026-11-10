import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Alert, CircularProgress } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useIntegrationConnectionApi } from 'hooks/api/actions/useIntegrationConnectionApi/useIntegrationConnectionApi';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { formatUnknownError } from 'utils/formatUnknownError';
import { formatIntegrationListPath } from '../integrationPaths.ts';

export const IntegrationConnected = () => {
    const providerId = useRequiredPathParam('providerId');
    const { hash } = useLocation();
    const navigate = useNavigate();
    const { completeConnection } = useIntegrationConnectionApi();
    const [result] = useState(() =>
        Object.fromEntries(new URLSearchParams(hash.slice(1))),
    );
    const [error, setError] = useState<string>();

    useEffect(() => {
        navigate({ hash: '' }, { replace: true });
        completeConnection(providerId, result)
            .then(({ path }) => navigate(path, { replace: true }))
            .catch((error: unknown) => setError(formatUnknownError(error)));
    }, [completeConnection, navigate, providerId, result]);

    return (
        <PageContent>
            {error ? (
                <Alert severity='error'>
                    {error}{' '}
                    <Link to={formatIntegrationListPath()}>
                        Back to integrations
                    </Link>
                </Alert>
            ) : (
                <CircularProgress aria-label='Connecting the integration' />
            )}
        </PageContent>
    );
};
