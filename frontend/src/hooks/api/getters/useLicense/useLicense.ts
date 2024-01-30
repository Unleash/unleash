import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR';

export interface LicenseInfo {
    isValid: boolean;
    message?: string;
    loading: boolean;
    reCheckLicense: () => void;
    error?: Error;
}

const fallback = {
    isValid: true,
    message: '',
    loading: false,
};

export interface License {
    license?: {
        token: string;
        customer: string;
        instanceName: string;
        plan: string;
        seats: number;
        expireAt: Date;
    };
    loading: boolean;
    refetchLicense: () => void;
    error?: Error;
}

export const useLicenseCheck = (): LicenseInfo => {
    const { data, error, mutate } = useEnterpriseSWR(
        fallback,
        formatApiPath(`api/admin/license/check`),
        fetcher,
    );

    return {
        isValid: data?.isValid,
        message: data?.message,
        loading: !error && !data,
        reCheckLicense: () => mutate(),
        error,
    };
};

export const useLicense = (): License => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/license`),
        fetcher,
    );

    return {
        license: { ...data },
        loading: !error && !data,
        refetchLicense: () => mutate(),
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('License'))
        .then((res) => res.json());
};
