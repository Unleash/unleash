import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

const KEY = `api/admin/invoices`;
const path = formatApiPath(KEY);

const useInvoices = (options: SWRConfiguration = {}) => {
    const fetcher = () => {
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Invoices'))
            .then(res => res.json());
    };

    const { data, error } = useSWR(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetchInvoices = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        invoices: data?.invoices || [],
        error,
        loading,
        refetchInvoices,
    };
};

export default useInvoices;
