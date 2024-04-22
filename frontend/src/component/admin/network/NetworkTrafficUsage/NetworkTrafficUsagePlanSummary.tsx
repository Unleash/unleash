import styled from '@mui/material/styles/styled';
import Box from '@mui/system/Box';
import Grid from '@mui/material/Grid';
import { flexRow } from 'themes/themeStyles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Badge } from 'component/common/Badge/Badge';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

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
    planIncludedRequests: number;
}

export const NetworkTrafficUsagePlanSummary = ({
    usageTotal,
    planIncludedRequests,
}: INetworkTrafficUsagePlanSummary) => {
    const { isPro } = useUiConfig();
    return (
        <StyledContainer>
            <Grid item>
                <StyledCardTitleRow>
                    <b>Number of requests to Unleash</b>
                </StyledCardTitleRow>
                <StyledCardDescription>
                    <RowContainer>
                        Incoming requests for selection{' '}
                        <StyledNumbersDiv>
                            <ConditionallyRender
                                condition={isPro()}
                                show={
                                    <ConditionallyRender
                                        condition={
                                            usageTotal <= planIncludedRequests
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
                                        {usageTotal.toLocaleString()} requests
                                    </Badge>
                                }
                            />
                        </StyledNumbersDiv>
                    </RowContainer>
                </StyledCardDescription>
                <ConditionallyRender
                    condition={isPro()}
                    show={
                        <StyledCardDescription>
                            <RowContainer>
                                Included in your plan monthly
                                <StyledNumbersDiv>
                                    {planIncludedRequests.toLocaleString()}{' '}
                                    requests
                                </StyledNumbersDiv>
                            </RowContainer>
                        </StyledCardDescription>
                    }
                />
            </Grid>
        </StyledContainer>
    );
};
