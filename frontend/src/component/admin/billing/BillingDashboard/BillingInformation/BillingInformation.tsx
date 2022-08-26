import { FC } from 'react';
import { Alert, Divider, Grid, styled, Typography } from '@mui/material';
import { BillingInformationButton } from './BillingInformationButton/BillingInformationButton';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IInstanceStatus, InstanceState } from 'interfaces/instance';

const StyledInfoBox = styled('aside')(({ theme }) => ({
    padding: theme.spacing(4),
    height: '100%',
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.secondaryContainer,
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
    borderColor: theme.palette.dividerAlternative,
}));
interface IBillingInformationProps {
    instanceStatus: IInstanceStatus;
}

export const BillingInformation: FC<IBillingInformationProps> = ({
    instanceStatus,
}) => {
    const inactive = instanceStatus.state !== InstanceState.ACTIVE;

    return (
        <Grid item xs={12} md={5}>
            <StyledInfoBox>
                <StyledTitle variant="body1">Billing information</StyledTitle>
                <ConditionallyRender
                    condition={inactive}
                    show={
                        <StyledAlert severity="warning">
                            In order to <strong>Upgrade trial</strong> you need
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
                <StyledDivider />
                <StyledInfoLabel>
                    <a href="mailto:elise@getunleash.ai?subject=PRO plan clarifications">
                        Get in touch with us
                    </a>{' '}
                    for any clarification
                </StyledInfoLabel>
            </StyledInfoBox>
        </Grid>
    );
};
