import styled from '@mui/material/styles/styled';
import Box from '@mui/system/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Badge } from 'component/common/Badge/Badge';
import { useUiFlag } from 'hooks/useUiFlag';

const StyledContainerGrid = styled(Grid)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    flex: '1 1',
}));

const StyledColumnGrid = styled(Grid)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
}));

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    flex: '1 1',
    padding: theme.spacing(3),
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledCardDescription = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(2),
}));

const RowContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
}));

const StyledNumbersDiv = styled('div')(({ theme }) => ({
    marginLeft: 'auto',
    display: 'flex',
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
        <StyledContainerGrid container spacing={4}>
            <StyledGrid item xs={5.5} md={5.5}>
                <StyledContainer>
                    <StyledColumnGrid item>
                        <Box>
                            <b>Number of requests to Unleash</b>
                        </Box>
                        <StyledCardDescription>
                            <RowContainer>
                                Incoming requests selected month{' '}
                                <StyledNumbersDiv>
                                    <Badge
                                        color={
                                            includedTraffic > 0
                                                ? usageTotal <= includedTraffic
                                                    ? 'success'
                                                    : 'error'
                                                : 'neutral'
                                        }
                                    >
                                        {usageTotal.toLocaleString()} requests
                                    </Badge>
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
                    </StyledColumnGrid>
                </StyledContainer>
            </StyledGrid>
            <ConditionallyRender
                condition={
                    estimateFlagEnabled && includedTraffic > 0 && overages > 0
                }
                show={
                    <StyledGrid item xs={5.5} md={5.5}>
                        <StyledContainer>
                            <StyledColumnGrid item>
                                <Box>
                                    <b>Accrued traffic charges</b>
                                </Box>
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
                                        Accrued traffic charges
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
                                                Estimated traffic charges based
                                                on current usage
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
                            </StyledColumnGrid>
                        </StyledContainer>
                    </StyledGrid>
                }
            />
        </StyledContainerGrid>
    );
};
