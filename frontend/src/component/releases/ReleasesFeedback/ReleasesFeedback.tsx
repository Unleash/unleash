import { Grid, styled, useTheme } from '@mui/material';
import { Card } from 'component/common/Card/Card';
import { Link } from 'react-router-dom';

const StyledGridItem = styled(Grid)({
    minHeight: '180px',
});

const StyledCardLink = styled(Link)(({ theme }) => ({
    color: 'inherit',
    textDecoration: 'none',
    border: 'none',
    padding: '0',
    background: theme.palette.background.paper,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightBold,
    pointer: 'cursor',
    display: 'block',
}));

const StyledCardTitle = styled('h3')(({ theme }) => ({
    margin: 0,
    marginRight: 'auto',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: '1.2',
}));

const StyledCard = styled(Card)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}));

export const ReleasesFeedback: React.FC = () => {
    const theme = useTheme();
    //theme.palette.primary.main = theme.palette.primary.main;
    theme.palette.background.default = theme.palette.neutral.light!;
    //theme.palette.text.secondary = theme.palette.background.alternative;
    // hover color
    theme.palette.neutral.light = theme.palette.neutral.light!;

    return (
        <StyledCard
            footer={
                <StyledCardLink to='https://docs.google.com/forms/d/1ElbScYxbAhFcjQWgRinifoymYHeuXzqIoQXfpUVYGR8/preview'>
                    Give feedback
                </StyledCardLink>
            }
        >
            We would love to get your feedback on the concept around release
            templates so we can bring it into our work going forward
        </StyledCard>
    );
};
