import useSWR, { type SWRConfiguration } from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { DetailedInvoicesSchema } from 'openapi';

const KEY = `api/admin/invoices/list`;
const path = formatApiPath(KEY);

export const useDetailedInvoices = (options: SWRConfiguration = {}) => {
    const fetcher = () =>
        fetch(path, { method: 'GET' })
            .then(handleErrorResponses('Detailed invoices'))
            .then((res) => res.json());

    const { data, error, isLoading } = useSWR<DetailedInvoicesSchema>(
        KEY,
        fetcher,
        options,
    );

    const invoices = useMemo(() => data?.invoices ?? [], [data]);

    // return { invoices, error, loading: isLoading };

    return {
        invoices: [
            // FIXME: MOCK
            {
                status: 'upcoming',
                dueDate: '2023-09-01',
                invoiceDate: '2023-08-01',
                invoicePDF: 'https://example.com/invoice/1.pdf',
                invoiceURL: 'https://example.com/invoice/1',
                totalAmount: 400,
                mainLines: [
                    {
                        currency: 'USD',
                        description: 'Service C',
                        lookupKey: 'service-c',
                        quantity: 0,
                        consumption: 100,
                        limit: 120,
                        totalAmount: 200,
                    },
                ],
                usageLines: [
                    {
                        currency: 'USD',
                        description: 'Service A',
                        lookupKey: 'service-a',
                        quantity: 1,
                        consumption: 100,
                        totalAmount: 100,
                    },
                    {
                        currency: 'USD',
                        description: 'Backend streaming connections',
                        lookupKey: 'service-b',
                        quantity: 324_000,
                        limit: 3_000_000,
                        consumption: 3_000_000,
                        totalAmount: 200,
                    },
                    {
                        currency: 'USD',
                        description: 'Frontend traffic bundle',
                        lookupKey: 'frontend-traffic-bundle',
                        quantity: 0,
                        consumption: 2_345_239,
                        limit: 5_000_000,
                        totalAmount: 0,
                    },
                ],
            },
            {
                status: 'invoiced',
                dueDate: '2023-09-15',
                invoiceDate: '2023-08-15',
                invoicePDF: 'https://example.com/invoice/2.pdf',
                invoiceURL: 'https://example.com/invoice/2',
                totalAmount: 200,
                mainLines: [
                    {
                        currency: 'EUR',
                        description: 'Service C',
                        lookupKey: 'service-c',
                        quantity: 1,
                        totalAmount: 200,
                    },
                ],
                usageLines: [],
            },
        ] satisfies DetailedInvoicesSchema['invoices'],
        error,
        loading: isLoading,
    };
};
