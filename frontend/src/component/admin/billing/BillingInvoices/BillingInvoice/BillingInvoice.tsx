import {
    Typography,
    styled,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatCurrency } from './types.ts';
import { Badge } from 'component/common/Badge/Badge.tsx';
import type { FC, ReactNode } from 'react';
import type { DetailedInvoicesResponseSchemaInvoicesItem } from 'openapi/index.ts';
import { BillingInvoiceRow } from './BillingInvoiceRow/BillingInvoiceRow.tsx';
import { BillingInvoiceFooter } from './BillingInvoiceFooter/BillingInvoiceFooter.tsx';
import { StyledSubgrid } from './BillingInvoice.styles.tsx';

const CardLikeAccordion = styled(Accordion)(({ theme }) => ({
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

    padding: theme.spacing(0, 2, 3),
}));

const HeaderCell = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.secondary,
    padding: theme.spacing(0, 0, 1),
}));

const TableBody: FC<{ children: ReactNode; title?: string }> = ({
    children,
    title,
}) => {
    return <StyledSubgrid withBackground={!!title}>{children}</StyledSubgrid>;
};

const StyledSectionTitle = styled(Typography)(({ theme }) => ({
    gridColumn: '1 / -1',
    padding: theme.spacing(2, 0),
    fontWeight: theme.fontWeight.bold,
}));

const StyledTableRow = styled('div')(({ theme }) => ({
    display: 'grid',
    gridColumn: '1 / -1',
    gridTemplateColumns: 'subgrid',
    padding: theme.spacing(1, 0),
}));

const sectionsMock = [
    {
        id: 'seats',
        items: [
            {
                description: 'Unleash PAYG Seat',
                quota: 50,
                quantity: 41,
                amount: 3_076,
            },
        ],
    },
    {
        id: 'usage',
        title: 'Usage: September',
        items: [
            {
                description: 'Frontend traffic',
                quota: 10_000_000,
                quantity: 1_085_000_000,
                amount: 5_425,
            },
            {
                description: 'Service connections',
                quota: 7,
                quantity: 20,
                amount: 0,
            },
            {
                description: 'Release templates',
                quota: 5,
                quantity: 3,
                amount: 0,
            },
            {
                description: 'Edge Frontend Traffic',
                quota: 10_000_000,
                quantity: 2_000_000,
                amount: 0,
            },
            {
                description: 'Edge Service Connections',
                quota: 5,
                quantity: 5,
                amount: 0,
            },
        ],
        summary: {
            subtotal: 8_500,
            taxExemptNote: 'Customer tax is exempt',
            total: 8_500,
        },
    },
];

export const BillingInvoice = ({
    status,
    dueDate,
    invoiceDate,
    invoicePDF,
    invoiceURL,
    totalAmount,
    lines,
}: DetailedInvoicesResponseSchemaInvoicesItem) => {
    const title = invoiceDate
        ? new Date(invoiceDate).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
          })
        : '';

    return (
        <CardLikeAccordion defaultExpanded>
            <HeaderRoot
                expandIcon={<ExpandMoreIcon />}
                id={`billing-invoice-${title}-header`}
            >
                <HeaderLeft>
                    <Typography
                        variant='h2'
                        component='h3'
                        sx={{ fontWeight: 700 }}
                    >
                        {title}
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
                    <Typography variant='body1' sx={{ fontWeight: 700 }}>
                        {formatCurrency(totalAmount)}
                    </Typography>
                </HeaderRight>
            </HeaderRoot>
            <AccordionDetails
                sx={(theme) => ({
                    padding: theme.spacing(3, 0, 0),
                    borderTop: `1px solid ${theme.palette.divider}`,
                })}
            >
                <StyledInvoiceGrid>
                    <StyledSubgrid>
                        <HeaderCell>Description</HeaderCell>
                        <HeaderCell>Included</HeaderCell>
                        <HeaderCell>Quantity</HeaderCell>
                        <HeaderCell>Amount</HeaderCell>
                    </StyledSubgrid>
                    {lines.map((line) => (
                        <TableBody
                            key={line.description}
                            // TODO: split into "usage" category
                            title={line.description}
                        >
                            {/* {line.description ? (
                                <StyledSectionTitle>
                                    {line.description}
                                </StyledSectionTitle>
                            ) : null} */}
                            <StyledTableRow key={line.description}>
                                <BillingInvoiceRow
                                    description={line.description}
                                    quota={line.limit}
                                    quantity={line.quantity}
                                    amount={line.totalAmount}
                                />
                            </StyledTableRow>
                        </TableBody>
                    ))}

                    <BillingInvoiceFooter totalAmount={totalAmount} />
                </StyledInvoiceGrid>
            </AccordionDetails>
        </CardLikeAccordion>
    );
};
