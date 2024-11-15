import { styled, useTheme, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useProjectStatus } from 'hooks/api/getters/useProjectStatus/useProjectStatus';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { HealthGridTile } from './ProjectHealthGrid.styles';

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
    width: 100,
    position: 'relative',
}));

const StyledSVG = styled('svg')({
    position: 'absolute',
});

export const ProjectHealth = () => {
    const projectId = useRequiredPathParam('projectId');
    const {
        data: { averageHealth },
    } = useProjectStatus(projectId);
    const { isOss } = useUiConfig();
    const theme = useTheme();
    const radius = 40;
    const strokeWidth = 13;
    const circumference = 2 * Math.PI * radius;

    const gapLength = 0.3;
    const filledLength = 1 - gapLength;
    const offset = 0.75 - gapLength / 2;
    const healthLength = (averageHealth / 100) * circumference * 0.7;

    const healthColor =
        averageHealth >= 0 && averageHealth <= 24
            ? theme.palette.error.main
            : averageHealth >= 25 && averageHealth <= 74
              ? theme.palette.warning.border
              : theme.palette.success.border;

    return (
        <HealthGridTile>
            <ChartRow>
                <SVGWrapper>
                    <StyledSVG viewBox='0 0 100 100'>
                        <circle
                            cx='50'
                            cy='50'
                            r={radius}
                            fill='none'
                            stroke={theme.palette.grey[300]}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${filledLength * circumference} ${gapLength * circumference}`}
                            strokeDashoffset={offset * circumference}
                        />
                        <circle
                            cx='50'
                            cy='50'
                            r={radius}
                            fill='none'
                            stroke={healthColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${healthLength} ${circumference - healthLength}`}
                            strokeDashoffset={offset * circumference}
                        />
                        <text
                            x='50'
                            y='50'
                            textAnchor='middle'
                            dominantBaseline='middle'
                            fill={theme.palette.text.primary}
                            fontSize='24px'
                        >
                            {averageHealth}%
                        </text>
                    </StyledSVG>
                </SVGWrapper>
                <TextContainer>
                    <Typography>
                        On average, your project health has remained at{' '}
                        {averageHealth}% the last 4 weeks
                    </Typography>
                    {!isOss() && (
                        <Link to='/insights'>View health over time</Link>
                    )}
                </TextContainer>
            </ChartRow>
        </HealthGridTile>
    );
};
