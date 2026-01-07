import { Alert, Divider, Grid, Paper, styled, Typography } from '@mui/material';
import { BillingInformationButton } from './BillingInformationButton/BillingInformationButton.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { InstanceState } from 'interfaces/instance';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';

const StyledInfoBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    height: '100%',
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(4),
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(4),
}));

const StyledInfoLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: `${theme.spacing(2.5)} 0`,
    borderColor: theme.palette.divider,
}));

export const BillingInformation = () => {
    const { instanceStatus } = useInstanceStatus();
    const {
        uiConfig: { billing },
    } = useUiConfig();
    const isPAYG = billing === 'pay-as-you-go';

    if (!instanceStatus)
        return (
            <Grid item xs={12} md={5}>
                <StyledInfoBox data-loading sx={{ flex: 1, height: '400px' }} />
            </Grid>
        );

    const plan = `${instanceStatus.plan}${isPAYG ? ' Pay-as-You-Go' : ''}`;
    const inactive = instanceStatus.state !== InstanceState.ACTIVE;
    const { isCustomBilling } = instanceStatus;

    return (
        <Grid item xs={12} md={5}>
            <StyledInfoBox>
                <StyledTitle variant='body1'>Billing information</StyledTitle>
                <ConditionallyRender
                    condition={Boolean(isCustomBilling)}
                    show={
                        <StyledInfoLabel>
                            Your billing is managed by Unleash
                        </StyledInfoLabel>
                    }
                    elseShow={
                        <>
                            <ConditionallyRender
                                condition={inactive}
                                show={
                                    <StyledAlert severity='warning'>
                                        In order to{' '}
                                        <strong>Upgrade trial</strong> you need
                                        to provide us your billing information.
                                    </StyledAlert>
                                }
                            />
                            <BillingInformationButton update={!inactive} />
                            <StyledInfoLabel>
                                {inactive
                                    ? 'Once we have received your billing information we will upgrade your trial within 1 business day'
                                    : 'Update your credit card and business information and change which email address we send invoices to'}
                            </StyledInfoLabel>
                        </>
                    }
                />
                <StyledDivider />
                <StyledInfoLabel>
                    <a
                        href={`mailto:support@getunleash.io?subject=${plan} plan clarifications`}
                    >
                        Get in touch with us
                    </a>{' '}
                    for any clarification
                </StyledInfoLabel>
            </StyledInfoBox>
        </Grid>
    );
};
