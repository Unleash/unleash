import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from 'hooks/api/getters/httpErrorResponseHandler';
import type { SWRConfiguration } from 'swr';
import { useConditionalSWR } from 'hooks/api/getters/useConditionalSWR/useConditionalSWR';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { useAuthEndpoint } from 'hooks/api/getters/useAuth/useAuthEndpoint';

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
    const { data: authData } = useAuthEndpoint();
    const { instanceStatus } = useInstanceStatus();
    const signupDialogEnabled = useUiFlag('signupDialog');

    const isPAYG = isEnterprise() && billing === 'pay-as-you-go';
    const shouldFetch = isPAYG && signupDialogEnabled;

    const {
        data: signupData,
        error,
        mutate,
    } = useConditionalSWR<SignupData | undefined>(
        shouldFetch,
        undefined,
        formatApiPath(ENDPOINT),
        fetcher,
        options,
    );

    const loading = shouldFetch && !error && !signupData;

    const isUCASignup = instanceStatus?.ucaSignup;
    const isUnleashUser =
        authData &&
        'user' in authData &&
        authData.user?.email?.toLowerCase().endsWith('@getunleash.io');
    const dataIncomplete = signupData && !signupData.companyRole;
    const signupRequired = isUCASignup && !isUnleashUser && dataIncomplete;

    return {
        signupData,
        signupRequired,
        loading,
        refetch: mutate,
        error,
    };
};

const fetcher = (path: string) =>
    fetch(path)
        .then(handleErrorResponses('Signup'))
        .then((res) => res.json());
