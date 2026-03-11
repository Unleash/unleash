import type { ComponentProps, FC, ReactNode } from 'react';
import {
    Typography,
    styled,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Divider,
} from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatCurrency } from './formatCurrency.ts';
import { Badge } from 'component/common/Badge/Badge.tsx';
import { BillingInvoiceFooter } from './BillingInvoiceFooter/BillingInvoiceFooter.tsx';
import { StyledAmountCell, StyledSubgrid } from './BillingInvoice.styles.tsx';
import type { DetailedInvoicesSchemaInvoicesItem } from 'openapi';
import { BillingInvoiceUsageRow } from './BillingInvoiceUsageRow/BillingInvoiceUsageRow.tsx';
import { BillingInvoiceMainRow } from './BillingInvoiceMainRow/BillingInvoiceMainRow.tsx';
import { calculateEstimateTotals } from './calculateEstimateTotals.ts';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    background: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: theme.boxShadows.card,
    '&:before': { display: 'none' },
    '&.MuiAccordion-root': {
        margin: 0,
        border: 'none',
    },
}));

const HeaderRoot = styled(AccordionSummary)(({ theme }) => ({
    padding: theme.spacing(2, 4),
    gap: theme.spacing(1.5),
    '& .MuiAccordionSummary-content': {
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1.5),
        '&.Mui-expanded': {
            margin: 0,
        },
    },
}));

const HeaderLeft = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    flex: 1,
    minWidth: 0,
}));

const HeaderRight = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const StyledInvoiceGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '45% 20% 15% 20%',
    padding: theme.spacing(0, 2, 2),
}));

const HeaderCell = styled('div')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.secondary,
}));

const TableBody: FC<{ children: ReactNode; title?: string }> = ({
    children,
    title,
}) => {
    return <StyledSubgrid withBackground={!!title}>{children}</StyledSubgrid>;
};

const StyledTableRow = styled('div')(({ theme }) => ({
    display: 'grid',
    gridColumn: '1 / -1',
    gridTemplateColumns: 'subgrid',
}));

const StyledTableTitle = styled('span')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    gridColumn: '1 / -1',
    margin: theme.spacing(0, 2),
}));

const CardActions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
    padding: theme.spacing(0, 2, 2),
}));

type BillingInvoiceProps = DetailedInvoicesSchemaInvoicesItem &
    Pick<ComponentProps<typeof Accordion>, 'defaultExpanded'>;

export const BillingInvoice = ({
    status,
    invoiceDate,
    invoicePDF,
    invoiceURL,
    totalAmount,
    subtotal,
    taxAmount,
    taxPercentage,
    currency,
    mainLines,
    usageLines,
    monthText,
    defaultExpanded,
}: BillingInvoiceProps) => {
    const formattedTitle = invoiceDate
        ? new Date(invoiceDate).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
          })
        : '';

    const isCurrentYear =
        new Date(invoiceDate).getFullYear() === new Date().getFullYear();
    const year = isCurrentYear
        ? `, ${new Date(invoiceDate).getFullYear()}`
        : '';

    const {
        subtotal: calculatedSubtotal,
        taxAmount: calculatedTaxAmount,
        totalAmount: calculatedTotalAmount,
    } = calculateEstimateTotals(
        status,
        subtotal,
        taxAmount,
        totalAmount,
        taxPercentage,
        mainLines,
        usageLines,
    );

    return (
        <StyledAccordion defaultExpanded={Boolean(defaultExpanded)}>
            <HeaderRoot
                expandIcon={<ExpandMoreIcon />}
                id={`billing-invoice-${formattedTitle}-header`}
            >
                <HeaderLeft>
                    <Typography
                        variant='h2'
                        component='h3'
                        sx={{ fontWeight: 700 }}
                    >
                        {formattedTitle}
                        {year}
                    </Typography>
                </HeaderLeft>
                <HeaderRight>
                    {status === 'estimate' ? (
                        <Badge color='disabled'>Estimate</Badge>
                    ) : null}
                    {status === 'upcoming' ? (
                        <Badge color='info'>Next invoice</Badge>
                    ) : null}
                    {status === 'invoiced' ? (
                        <Badge color='success'>Invoiced</Badge>
                    ) : null}
                    {status === 'paid' ? (
                        <Badge color='success'>Paid</Badge>
                    ) : null}
                    <Typography variant='body1' sx={{ fontWeight: 700 }}>
                        {formatCurrency(calculatedTotalAmount, currency)}
                    </Typography>
                </HeaderRight>
            </HeaderRoot>
            <AccordionDetails
                sx={(theme) => ({
                    padding: theme.spacing(2, 0, 0),
                    borderTop: `1px solid ${theme.palette.divider}`,
                })}
            >
                <StyledInvoiceGrid>
                    <TableBody>
                        <StyledTableRow>
                            <HeaderCell>Description</HeaderCell>
                            <HeaderCell />
                            <HeaderCell>Quantity</HeaderCell>
                            <HeaderCell>
                                <StyledAmountCell>Amount</StyledAmountCell>
                            </HeaderCell>
                        </StyledTableRow>
                        {mainLines.map((line) => (
                            <StyledTableRow key={line.description}>
                                <BillingInvoiceMainRow
                                    {...line}
                                    invoiceCurrency={currency}
                                />
                            </StyledTableRow>
                        ))}
                    </TableBody>
                    {usageLines.length ? (
                        <TableBody key='usage' title='Usage'>
                            <StyledTableRow>
                                <HeaderCell>
                                    <StyledTableTitle>
                                        Usage – {monthText}
                                    </StyledTableTitle>
                                </HeaderCell>
                                <HeaderCell>Included</HeaderCell>
                                <HeaderCell>Overages</HeaderCell>
                                <HeaderCell>
                                    <StyledAmountCell>Amount</StyledAmountCell>
                                </HeaderCell>
                            </StyledTableRow>
                            {usageLines.map((line) => (
                                <StyledTableRow key={line.description}>
                                    <BillingInvoiceUsageRow
                                        {...line}
                                        invoiceCurrency={currency}
                                        invoiceStatus={status}
                                    />
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    ) : (
                        <StyledDivider />
                    )}

                    <BillingInvoiceFooter
                        subTotal={calculatedSubtotal}
                        taxAmount={calculatedTaxAmount}
                        taxPercentage={taxPercentage}
                        totalAmount={calculatedTotalAmount}
                        currency={currency}
                        status={status}
                    />
                </StyledInvoiceGrid>
                {invoiceURL || invoicePDF ? (
                    <CardActions>
                        {invoiceURL ? (
                            <Button
                                variant='outlined'
                                href={invoiceURL}
                                target='_blank'
                                rel='noreferrer'
                                startIcon={<ReceiptLongOutlinedIcon />}
                            >
                                View invoice
                            </Button>
                        ) : null}
                        {invoicePDF ? (
                            <Button
                                variant='outlined'
                                href={invoicePDF}
                                target='_blank'
                                rel='noreferrer'
                                startIcon={<DownloadOutlinedIcon />}
                            >
                                Download PDF
                            </Button>
                        ) : null}
                    </CardActions>
                ) : null}
            </AccordionDetails>
        </StyledAccordion>
    );
};
