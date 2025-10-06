import useSWR, { type SWRConfiguration } from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { DetailedInvoicesResponseSchema } from 'openapi';

const KEY = `api/admin/invoices/list`;
const path = formatApiPath(KEY);

export const useDetailedInvoices = (options: SWRConfiguration = {}) => {
    const fetcher = () =>
        fetch(path, { method: 'GET' })
            .then(handleErrorResponses('Detailed invoices'))
            .then((res) => res.json());

    const { data, error, isLoading } = useSWR<DetailedInvoicesResponseSchema>(
        KEY,
        fetcher,
        options,
    );

    const invoices = useMemo(() => data?.invoices ?? [], [data]);

    // return { invoices, error, loading: isLoading };

    return {
        invoices: [
            // TODO:MOCK
            {
                id: '1',
                status: 'paid',
                dueDate: '2023-09-01',
                invoiceDate: '2023-08-01',
                invoicePDF: 'https://example.com/invoice/1.pdf',
                invoiceURL: 'https://example.com/invoice/1',
                totalAmount: 100,
                lines: [
                    {
                        description: 'Service A',
                        quantity: 1,
                        totalAmount: 100,
                    },
                    {
                        description: 'Service B',
                        quantity: 2,
                        totalAmount: 200,
                    },
                ],
            },
            {
                id: '2',
                status: 'unpaid',
                dueDate: '2023-09-15',
                invoiceDate: '2023-08-15',
                invoicePDF: 'https://example.com/invoice/2.pdf',
                invoiceURL: 'https://example.com/invoice/2',
                totalAmount: 200,
                lines: [
                    {
                        description: 'Service C',
                        quantity: 1,
                        totalAmount: 200,
                    },
                ],
            },
        ],
        error,
        loading: isLoading,
    };
};

export default useDetailedInvoices;
