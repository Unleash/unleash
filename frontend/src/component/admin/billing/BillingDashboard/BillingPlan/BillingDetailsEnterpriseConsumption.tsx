import { styled, Typography, Grid, Button } from '@mui/material';
import { GridRow } from 'component/common/GridRow/GridRow';
import { GridCol } from 'component/common/GridCol/GridCol';
import LaunchIcon from '@mui/icons-material/Launch';
import { formatApiPath } from 'utils/formatPath';

const _StyledInfoLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(1),
    display: 'inline-flex',
    alignItems: 'center',
}));

export const BillingDetailsEnterpriseConsumption = () => {
    const PORTAL_URL = formatApiPath('api/admin/invoices/portal');

    return (
        <>
            <Grid container>
                <GridRow sx={(theme) => ({ marginBottom: theme.spacing(3) })}>
                    <GridCol vertical>
                        <StyledButton
                            href={PORTAL_URL}
                            variant='outlined'
                            endIcon={<LaunchIcon />}
                        >
                            View usage charges
                        </StyledButton>
                    </GridCol>
                </GridRow>
            </Grid>
        </>
    );
};
