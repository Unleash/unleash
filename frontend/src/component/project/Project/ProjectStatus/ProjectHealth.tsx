import { styled, useTheme, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useProjectStatus } from 'hooks/api/getters/useProjectStatus/useProjectStatus';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { HealthGridTile } from './ProjectHealthGrid.styles';
import { PrettifyLargeNumber } from 'component/common/PrettifyLargeNumber/PrettifyLargeNumber';

const ChartRadius = 40;
const ChartStrokeWidth = 13;
const ChartTotalWidth = ChartRadius * 2 + ChartStrokeWidth;
const ChartContainerWidth = 100;

const TextContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const ChartRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const SVGWrapper = styled('div')(({ theme }) => ({
    flex: 'none',
    height: 85,
    width: ChartContainerWidth,
    position: 'relative',
}));

const StyledSVG = styled('svg')({
    position: 'absolute',
});

const BigText = styled('span')(({ theme }) => ({
    fontSize: theme.typography.h1.fontSize,
}));

const UnhealthyStatContainer = styled('div')(({ theme }) => ({
    flex: 'none',
    display: 'grid',
    placeItems: 'center',
    width: ChartContainerWidth,
}));

const UnhealthyStatText = styled('p')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor:
        theme.mode === 'light'
            ? theme.palette.background.elevation2
            : '#302E42', // in dark mode, elevation2 and elevation1 are the same color. This is an alternative
    width: ChartTotalWidth,
    height: ChartTotalWidth,
    overflow: 'hidden',
}));

const UnhealthyFlagBox = ({ flagCount }: { flagCount: number }) => {
    const flagWord = flagCount === 1 ? 'flag' : 'flags';
    return (
        <UnhealthyStatContainer>
            <UnhealthyStatText>
                <BigText>
                    <PrettifyLargeNumber
                        value={flagCount}
                        threshold={1000}
                        precision={1}
                    />
                </BigText>
                <span>unhealthy</span>
                <span>{flagWord}</span>
            </UnhealthyStatText>
        </UnhealthyStatContainer>
    );
};

const Wrapper = styled(HealthGridTile)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    gap: theme.spacing(2),
}));

export const ProjectHealth = () => {
    const projectId = useRequiredPathParam('projectId');
    const {
        data: { health, staleFlags },
    } = useProjectStatus(projectId);
    const healthRating = health.current;
    const { isOss } = useUiConfig();
    const theme = useTheme();
    const circumference = 2 * Math.PI * ChartRadius; //

    const gapLength = 0.3;
    const filledLength = 1 - gapLength;
    const offset = 0.75 - gapLength / 2;
    const healthLength = (healthRating / 100) * circumference * 0.7;

    const healthColor =
        healthRating >= 0 && healthRating <= 24
            ? theme.palette.error.main
            : healthRating >= 25 && healthRating <= 74
              ? theme.palette.warning.border
              : theme.palette.success.border;

    return (
        <Wrapper>
            <ChartRow>
                <SVGWrapper>
                    <StyledSVG viewBox='0 0 100 100'>
                        <circle
                            cx='50'
                            cy='50'
                            r={ChartRadius}
                            fill='none'
                            stroke={theme.palette.background.application}
                            strokeWidth={ChartStrokeWidth}
                            strokeDasharray={`${filledLength * circumference} ${gapLength * circumference}`}
                            strokeDashoffset={offset * circumference}
                        />
                        <circle
                            cx='50'
                            cy='50'
                            r={ChartRadius}
                            fill='none'
                            stroke={healthColor}
                            strokeWidth={ChartStrokeWidth}
                            strokeDasharray={`${healthLength} ${circumference - healthLength}`}
                            strokeDashoffset={offset * circumference}
                        />
                        <text
                            x='50'
                            y='50'
                            textAnchor='middle'
                            dominantBaseline='middle'
                            fill={theme.palette.text.primary}
                            fontSize={theme.typography.h1.fontSize}
                        >
                            {healthRating}%
                        </text>
                    </StyledSVG>
                </SVGWrapper>
                <TextContainer>
                    <Typography>
                        Your current project health rating is {healthRating}%
                    </Typography>
                    {!isOss() && (
                        <Link to={`/insights?project=IS%3A${projectId}`}>
                            View health over time
                        </Link>
                    )}
                </TextContainer>
            </ChartRow>
            <ChartRow>
                <UnhealthyFlagBox flagCount={staleFlags.total} />
                <TextContainer>
                    <Typography variant='body2'>
                        To keep your project healthy, archive stale feature
                        flags and remove code from your code base to reduce
                        technical debt.
                    </Typography>
                    <Link
                        to={`/projects/${projectId}?state=IS_ANY_OF%3Astale%2Cpotentially-stale`}
                    >
                        View unhealthy flags
                    </Link>
                </TextContainer>
            </ChartRow>
        </Wrapper>
    );
};
