import { useContext } from 'react';
import { formatApiPath } from 'utils/formatPath';
import AccessContext from 'contexts/AccessContext';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { useUiFlag } from 'hooks/useUiFlag';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import type { InstanceCredit } from 'interfaces/instance.js';

type InstanceCredits = { credits: InstanceCredit[] };

const NO_CREDITS: InstanceCredits = { credits: [] };

export const useInstanceCredits = () => {
    const { hasAccess } = useContext(AccessContext);
    const paygCredits = useUiFlag('paygCredits');
    const { data, error, isLoading } = useConditionalSWR<InstanceCredits>(
        paygCredits && hasAccess(ADMIN),
        NO_CREDITS,
        formatApiPath('api/instance/credits'),
        fetcher,
    );

    return { credits: data?.credits ?? [], loading: isLoading && !error };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Instance credits'))
        .then((res) => res.json());
};
