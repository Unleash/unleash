import styled from '@mui/material/styles/styled';
import Box from '@mui/system/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { flexRow } from 'themes/themeStyles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Badge } from 'component/common/Badge/Badge';
import { useUiFlag } from 'hooks/useUiFlag';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledCardTitleRow = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledCardDescription = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(2),
}));

const RowContainer = styled(Box)(({ theme }) => ({
    ...flexRow,
}));

const StyledNumbersDiv = styled('div')(({ theme }) => ({
    marginLeft: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    textDecoration: 'none',
    color: theme.palette.text.primary,
}));

interface INetworkTrafficUsagePlanSummary {
    usageTotal: number;
    includedTraffic: number;
    overageCost: number;
    estimatedMonthlyCost: number;
}

export const NetworkTrafficUsagePlanSummary = ({
    usageTotal,
    includedTraffic,
    overageCost,
    estimatedMonthlyCost,
}: INetworkTrafficUsagePlanSummary) => {
    const overages = usageTotal - includedTraffic;
    const estimateFlagEnabled = useUiFlag('estimateTrafficDataCost');
    return (
        <Grid container spacing={4} xs={11} md={11}>
            <Grid item xs={6} md={6}>
                <StyledContainer>
                    <Grid item>
                        <StyledCardTitleRow>
                            <b>Number of requests to Unleash</b>
                        </StyledCardTitleRow>
                        <StyledCardDescription>
                            <RowContainer>
                                Incoming requests selected month{' '}
                                <StyledNumbersDiv>
                                    <ConditionallyRender
                                        condition={includedTraffic > 0}
                                        show={
                                            <ConditionallyRender
                                                condition={
                                                    usageTotal <=
                                                    includedTraffic
                                                }
                                                show={
                                                    <Badge color='success'>
                                                        {usageTotal.toLocaleString()}{' '}
                                                        requests
                                                    </Badge>
                                                }
                                                elseShow={
                                                    <Badge color='error'>
                                                        {usageTotal.toLocaleString()}{' '}
                                                        requests
                                                    </Badge>
                                                }
                                            />
                                        }
                                        elseShow={
                                            <Badge color='neutral'>
                                                {usageTotal.toLocaleString()}{' '}
                                                requests
                                            </Badge>
                                        }
                                    />
                                </StyledNumbersDiv>
                            </RowContainer>
                        </StyledCardDescription>
                        <ConditionallyRender
                            condition={includedTraffic > 0}
                            show={
                                <StyledCardDescription>
                                    <RowContainer>
                                        Included in your plan monthly
                                        <StyledNumbersDiv>
                                            {includedTraffic.toLocaleString()}{' '}
                                            requests
                                        </StyledNumbersDiv>
                                    </RowContainer>
                                </StyledCardDescription>
                            }
                        />
                    </Grid>
                </StyledContainer>
            </Grid>
            <ConditionallyRender
                condition={
                    estimateFlagEnabled && includedTraffic > 0 && overages > 0
                }
                show={
                    <Grid item xs={6} md={6}>
                        <StyledContainer>
                            <Grid item>
                                <StyledCardTitleRow>
                                    <b>Estimated traffic charges</b>
                                </StyledCardTitleRow>
                                <StyledCardDescription>
                                    <RowContainer>
                                        Requests overages this month (
                                        <Link href='https://www.getunleash.io/pricing'>
                                            pricing
                                        </Link>
                                        )
                                        <StyledNumbersDiv>
                                            {overages.toLocaleString()} requests
                                        </StyledNumbersDiv>
                                    </RowContainer>
                                    <RowContainer>
                                        Estimated traffic charges
                                        <StyledNumbersDiv>
                                            <Badge color='secondary'>
                                                {overageCost} USD
                                            </Badge>
                                        </StyledNumbersDiv>
                                    </RowContainer>
                                    <ConditionallyRender
                                        condition={estimatedMonthlyCost > 0}
                                        show={
                                            <RowContainer>
                                                Estimated traffic charges
                                                <StyledNumbersDiv>
                                                    <Badge color='secondary'>
                                                        {estimatedMonthlyCost}{' '}
                                                        USD
                                                    </Badge>
                                                </StyledNumbersDiv>
                                            </RowContainer>
                                        }
                                    />
                                </StyledCardDescription>
                            </Grid>
                        </StyledContainer>
                    </Grid>
                }
            />
        </Grid>
    );
};
