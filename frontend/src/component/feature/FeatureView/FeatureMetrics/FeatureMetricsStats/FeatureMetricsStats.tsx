import { calculatePercentage } from 'utils/calculatePercentage';
import { Grid, styled } from '@mui/material';
import { PrettifyLargeNumber } from 'component/common/PrettifyLargeNumber/PrettifyLargeNumber';

export interface IFeatureMetricsStatsProps {
    totalYes: number;
    totalNo: number;
    hoursBack: number;
    statsSectionId?: string;
    tableSectionId?: string;
}

const StyledItem = styled('article')(({ theme }) => ({
    padding: theme.spacing(2),
    background: 'transparent',
    borderRadius: theme.spacing(2),
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(4),
    },
}));

const StyledTitle = styled('h3')(({ theme }) => ({
    margin: 0,
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.fontWeight.thin,
}));

const StyledValue = styled('p')(({ theme }) => ({
    fontSize: '2.25rem',
    fontWeight: theme.fontWeight.bold,
    color: theme.palette.primary.main,
}));

const StyledText = styled('p')(({ theme }) => ({
    margin: theme.spacing(1, 0, 0, 0),
    padding: theme.spacing(2, 0, 0, 0),
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: theme.palette.divider,
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

export const FeatureMetricsStats = ({
    totalYes,
    totalNo,
    hoursBack,
    statsSectionId,
    tableSectionId,
}: IFeatureMetricsStatsProps) => {
    const hoursSuffix =
        hoursBack === 1 ? 'in the last hour' : `in the last ${hoursBack} hours`;

    return (
        <Grid
            container
            spacing={2}
            id={statsSectionId}
            aria-describedby={tableSectionId}
            aria-label="Feature metrics summary"
            component="section"
        >
            <Grid item xs={12} sm={4}>
                <StyledItem>
                    <StyledTitle>Exposure</StyledTitle>
                    <StyledValue>
                        <PrettifyLargeNumber value={totalYes} />
                    </StyledValue>
                    <StyledText>
                        Total exposure of the feature in the environment{' '}
                        {hoursSuffix}.
                    </StyledText>
                </StyledItem>
            </Grid>
            <Grid item xs={12} sm={4}>
                <StyledItem>
                    <StyledTitle>Exposure %</StyledTitle>
                    <StyledValue>
                        {calculatePercentage(totalYes + totalNo, totalYes)}%
                    </StyledValue>
                    <StyledText>
                        % total exposure of the feature in the environment{' '}
                        {hoursSuffix}.
                    </StyledText>
                </StyledItem>
            </Grid>
            <Grid item xs={12} sm={4}>
                <StyledItem>
                    <StyledTitle>Requests</StyledTitle>
                    <StyledValue>
                        <PrettifyLargeNumber value={totalYes + totalNo} />
                    </StyledValue>
                    <StyledText>
                        Total requests for the feature in the environment{' '}
                        {hoursSuffix}.
                    </StyledText>
                </StyledItem>
            </Grid>
        </Grid>
    );
};
