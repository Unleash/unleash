import type React from 'react';
import { useTheme, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface ProjectHealthProps {
    health: number;
}

const HealthContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.envAccordion.expanded,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusExtraLarge,
    minWidth: '300px',
    fontSize: theme.spacing(1.75),
}));

const ChartRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

const StyledSVG = styled('svg')({
    width: 200,
    height: 100,
});

const DescriptionText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

export const ProjectHealth: React.FC<ProjectHealthProps> = ({ health }) => {
    const { isOss } = useUiConfig();
    const theme = useTheme();
    const radius = 40;
    const strokeWidth = 13;
    const circumference = 2 * Math.PI * radius;

    const gapLength = 0.3;
    const filledLength = 1 - gapLength;
    const offset = 0.75 - gapLength / 2;
    const healthLength = (health / 100) * circumference * 0.7;

    return (
        <HealthContainer>
            <ChartRow>
                <StyledSVG viewBox='0 0 100'>
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
                        stroke={theme.palette.warning.border}
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
                        fontSize='16px'
                        fontWeight='bold'
                    >
                        {health}%
                    </text>
                </StyledSVG>
                <Typography variant='body2'>
                    On average, your project health has remained at {health}%
                    the last 4 weeks
                </Typography>
            </ChartRow>
            <DescriptionText variant='body2'>
                Remember to archive your stale feature flags to keep the project
                health growing
            </DescriptionText>
            {!isOss() && <Link to='/insights'>View health over time</Link>}
        </HealthContainer>
    );
};
