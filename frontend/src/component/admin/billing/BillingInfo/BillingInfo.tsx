import type { FC } from 'react';
import { Button, Divider, Paper, styled, Typography } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { InstanceState } from 'interfaces/instance';
import { formatApiPath } from 'utils/formatPath';
import { useDetailedInvoices } from 'hooks/api/getters/useDetailedInvoices/useDetailedInvoices';
import { formatCurrency } from '../BillingInvoices/BillingInvoice/formatCurrency.js';
const PORTAL_URL = formatApiPath('api/admin/invoices');

type BillingInfoProps = {};

const StyledWrapper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: theme.boxShadows.card,
}));

const StyledRow = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
    gap: theme.spacing(1),
}));

const StyledItemTitle = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
}));

const StyledItemValue = styled('span')(({ theme }) => ({
    textAlign: 'right',
}));

const StyledButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(0, 0, 2, 0),
}));

const StyledInfoLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: `${theme.spacing(2.5)} 0`,
    borderColor: theme.palette.divider,
}));

const GetInTouch: FC = () => (
    <StyledInfoLabel>
        <a
            href={`mailto:support@getunleash.io?subject=Billing plan clarifications`}
        >
            Get in touch with us
        </a>{' '}
        for any clarification
    </StyledInfoLabel>
);

export const BillingInfo: FC<BillingInfoProps> = () => {
    const { instanceStatus } = useInstanceStatus();
    const {
        uiConfig: { billing },
    } = useUiConfig();
    const { planPrice, planCurrency } = useDetailedInvoices();

    if (!instanceStatus) {
        return (
            <StyledWrapper>
                <StyledInfoLabel>
                    Your billing is managed by Unleash
                </StyledInfoLabel>
                <GetInTouch />
            </StyledWrapper>
        );
    }

    const isPAYG = billing === 'pay-as-you-go';
    const isEnterpriseConsumption = billing === 'enterprise-consumption';
    const inactive = instanceStatus.state !== InstanceState.ACTIVE;
    const { isCustomBilling } = instanceStatus;

    if (isCustomBilling) {
        return (
            <StyledWrapper>
                <StyledInfoLabel>
                    Your billing is managed by Unleash
                </StyledInfoLabel>
                <GetInTouch />
            </StyledWrapper>
        );
    }

    return (
        <StyledWrapper>
            <Typography variant='h3'>Billing details</Typography>
            <StyledRow>
                <StyledItemTitle>Current plan</StyledItemTitle>{' '}
                <StyledItemValue>
                    {isPAYG && isEnterpriseConsumption
                        ? 'Consumption'
                        : 'Pay-as-You-Go'}
                </StyledItemValue>
            </StyledRow>
            <StyledRow>
                <StyledItemTitle>Plan price</StyledItemTitle>{' '}
                <StyledItemValue>
                    {planPrice !== undefined
                        ? `${formatCurrency(planPrice, planCurrency)} ${
                              isPAYG ? 'per seat' : '/ month'
                          }`
                        : '-'}
                </StyledItemValue>
            </StyledRow>
            <StyledDivider />
            <StyledButton
                href={`${PORTAL_URL}/${!inactive ? 'portal' : 'checkout'}`}
                variant={!inactive ? 'outlined' : 'contained'}
                startIcon={<CreditCardIcon />}
            >
                {!inactive ? 'Edit billing details' : 'Add billing details'}
            </StyledButton>
            <StyledInfoLabel>
                {inactive
                    ? 'Once we have received your billing information we will upgrade your trial within 1 business day.'
                    : 'Update your credit card and business information and change which email address we send invoices to.'}
            </StyledInfoLabel>
            <GetInTouch />
        </StyledWrapper>
    );
};
