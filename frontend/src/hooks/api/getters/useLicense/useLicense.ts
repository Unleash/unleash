import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR.js';
import type { BannerVariant } from 'interfaces/banner';

export interface LicenseInfo {
    isValid: boolean;
    message?: string;
    messageType?: BannerVariant;
    loading: boolean;
    reCheckLicense: () => void;
    error?: Error;
}

const fallback = {
    isValid: true,
    message: '',
    loading: false,
};

type LicenseResources = {
    seats?: number;
    releaseTemplates?: number;
    edgeInstances?: number;
};

export interface License {
    license?: {
        token: string;
        customer: string;
        instanceName: string;
        plan: string;
        resources: LicenseResources;
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
        messageType: data?.messageType,
        loading: !error && !data,
        reCheckLicense: () => mutate(),
        error,
    };
};

export const useLicense = (): License => {
    const { data, error, mutate } = useEnterpriseSWR(
        undefined,
        formatApiPath(`api/admin/license`),
        fetcher,
    );

    return {
        license: data,
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
