import { useMemo, useState } from 'react';
import { Alert, LinearProgress } from '@mui/material';
import { useApplicationApiTokens } from 'hooks/api/getters/useApplicationApiTokens/useApplicationApiTokens';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { ApplicationOverviewSchema } from 'openapi';
import { CreateTokenPanel } from '../ApplicationApiTokens/CreateTokenPanel/CreateTokenPanel.tsx';
import { ApplicationEnvironments } from './ApplicationEnvironments/ApplicationEnvironments.tsx';
import { buildApplicationEnvironments } from './buildApplicationEnvironments.ts';

const hiddenTokensNotice = (hiddenTokenTypes: string[], forbidden: boolean) => {
    if (forbidden) {
        return "Linked tokens are not shown: you don't have permission to read API tokens.";
    }
    if (hiddenTokenTypes.length > 0) {
        return `${capitalizeFirst(hiddenTokenTypes[0])} tokens are not shown: you don't have permission to read them.`;
    }
    return undefined;
};

interface IApplicationOverviewPanelsProps {
    overview: Pick<ApplicationOverviewSchema, 'environments' | 'projects'>;
}

export const ApplicationOverviewPanels = ({
    overview,
}: IApplicationOverviewPanelsProps) => {
    const name = useRequiredPathParam('name');
    const { tokens, loading, error, forbidden, hiddenTokenTypes } =
        useApplicationApiTokens(name);
    const { environments, loading: environmentsLoading } = useEnvironments();
    const [createTokenIn, setCreateTokenIn] = useState<string>();
    const applicationEnvironments = useMemo(
        () => buildApplicationEnvironments({ overview, tokens, environments }),
        [overview, tokens, environments],
    );

    if (loading || environmentsLoading) {
        return <LinearProgress />;
    }

    const allTokensVisible = !error && hiddenTokenTypes.length === 0;
    const notice = hiddenTokensNotice(hiddenTokenTypes, forbidden);

    return (
        <>
            {error ? (
                <Alert severity='error'>
                    Could not load the API tokens: {formatUnknownError(error)}
                </Alert>
            ) : null}
            {notice ? <Alert severity='info'>{notice}</Alert> : null}
            <ApplicationEnvironments
                environments={applicationEnvironments}
                allTokensVisible={allTokensVisible}
                tokensPath={`/applications/${encodeURIComponent(name)}/tokens`}
                onCreateToken={setCreateTokenIn}
            />
            {createTokenIn ? (
                <CreateTokenPanel
                    appName={name}
                    preferredEnvironment={createTokenIn}
                    onClose={() => setCreateTokenIn(undefined)}
                />
            ) : null}
        </>
    );
};
