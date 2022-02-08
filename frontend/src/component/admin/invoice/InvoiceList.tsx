import { useEffect, useState } from 'react';
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Button,
} from '@material-ui/core';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { formatDateWithLocale } from '../../common/util';
import PageContent from '../../common/PageContent';
import HeaderTitle from '../../common/HeaderTitle';
import ConditionallyRender from '../../common/ConditionallyRender';
import { formatApiPath } from '../../../utils/format-path';
import useInvoices from '../../../hooks/api/getters/useInvoices/useInvoices';
import { IInvoice } from '../../../interfaces/invoice';
import { useLocationSettings } from '../../../hooks/useLocationSettings';

const PORTAL_URL = formatApiPath('api/admin/invoices/portal');

const InvoiceList = () => {
    const { refetchInvoices, invoices } = useInvoices();
    const [isLoaded, setLoaded] = useState(false);
    const { locationSettings } = useLocationSettings();

    useEffect(() => {
        refetchInvoices();
        setLoaded(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ConditionallyRender
            condition={invoices.length > 0}
            show={
                <PageContent
                    headerContent={
                        <HeaderTitle
                            title="Invoices"
                            actions={
                                <Button
                                    href={PORTAL_URL}
                                    rel="noreferrer"
                                    target="_blank"
                                    endIcon={<OpenInNew />}
                                >
                                    Billing portal
                                </Button>
                            }
                        />
                    }
                >
                    <div>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Due date</TableCell>
                                    <TableCell>PDF</TableCell>
                                    <TableCell>Link</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {invoices.map((item: IInvoice) => (
                                    <TableRow
                                        key={item.invoiceURL}
                                        style={{
                                            backgroundColor:
                                                item.status === 'past-due'
                                                    ? '#ff9194'
                                                    : 'inherit',
                                        }}
                                    >
                                        <TableCell
                                            style={{ textAlign: 'left' }}
                                        >
                                            {item.amountFomratted}
                                        </TableCell>
                                        <TableCell
                                            style={{ textAlign: 'left' }}
                                        >
                                            {item.status}
                                        </TableCell>
                                        <TableCell
                                            style={{ textAlign: 'left' }}
                                        >
                                            {item.dueDate &&
                                                formatDateWithLocale(
                                                    item.dueDate,
                                                    locationSettings.locale
                                                )}
                                        </TableCell>
                                        <TableCell
                                            style={{ textAlign: 'left' }}
                                        >
                                            <a href={item.invoicePDF}>PDF</a>
                                        </TableCell>
                                        <TableCell
                                            style={{ textAlign: 'left' }}
                                        >
                                            <a
                                                href={item.invoiceURL}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Payment link
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </PageContent>
            }
            elseShow={<div>{isLoaded && 'No invoices to show.'}</div>}
        />
    );
};
export default InvoiceList;
