import useSWR, { type SWRConfiguration } from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import { createFetcher } from '../useApiGetter/useApiGetter.js';
import type { DetailedInvoicesSchema } from 'openapi';

const KEY = `api/admin/invoices/list`;
const path = formatApiPath(KEY);

export const useDetailedInvoices = (options: SWRConfiguration = {}) => {
    const fetcher = createFetcher({
        url: path,
        errorTarget: 'Detailed invoices',
    });

    const { data, error, isLoading } = useSWR<DetailedInvoicesSchema>(
        KEY,
        fetcher,
        options,
    );

    const invoices = useMemo(() => data?.invoices ?? [], [data]);
    const planPrice = data?.planPrice;
    const planCurrency = data?.planCurrency;

    return { invoices, planPrice, planCurrency, error, loading: isLoading };
};
