import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from 'hooks/api/getters/httpErrorResponseHandler';
import type { SWRConfiguration } from 'swr';
import { useConditionalSWR } from 'hooks/api/getters/useConditionalSWR/useConditionalSWR';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';

export type SignupData = {
    shouldSetPassword?: boolean;
    name?: string;
    companyRole?: string;
    companyName?: string;
    companyIsNA?: boolean;
    productUpdatesEmailConsent?: boolean;
};

const ENDPOINT = 'api/admin/signup';

export const useSignup = (options?: SWRConfiguration) => {
    const {
        isEnterprise,
        uiConfig: { billing },
    } = useUiConfig();
    const { instanceStatus } = useInstanceStatus();
    const isPAYG = isEnterprise() && billing === 'pay-as-you-go';
    const signupDialogEnabled = useUiFlag('signupDialog');

    const { data, error, mutate } = useConditionalSWR<SignupData | undefined>(
        isPAYG && signupDialogEnabled,
        undefined,
        formatApiPath(ENDPOINT),
        fetcher,
        options,
    );

    return useMemo(
        () => ({
            signupData: data,
            signupRequired: Boolean(
                instanceStatus?.ucaSignup &&
                    data &&
                    (data.shouldSetPassword ||
                        !data.companyRole ||
                        !data.companyName),
            ),
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, instanceStatus, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Signup'))
        .then((res) => res.json());
};
