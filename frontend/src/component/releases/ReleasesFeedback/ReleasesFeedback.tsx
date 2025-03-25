import { styled } from '@mui/material';
import { Card } from 'component/common/Card/Card';
import { Link } from 'react-router-dom';

const StyledCardLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.links,
    '&:hover, &:focus': {
        textDecoration: 'none',
    },
}));

const StyledCardTitle = styled('h3')(({ theme }) => ({
    margin: 0,
    marginRight: 'auto',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: '1.2',
    color: theme.typography.h3.color,
}));

const StyledCard = styled(Card)(({ theme }) => ({
    backgroundColor: theme.palette.secondary.light,
    '&:hover': {
        backgroundColor: theme.palette.secondary.light,
    },
    borderColor: theme.palette.secondary.border,
    color: theme.palette.text.secondary,
}));

export const ReleasesFeedback: React.FC<{
    title: string;
    children?: React.ReactNode;
}> = ({ title, children }: { title: string; children?: React.ReactNode }) => {
    return (
        <StyledCard
            title={<StyledCardTitle>{title}</StyledCardTitle>}
            footer={
                <StyledCardLink to='https://docs.google.com/forms/d/1ElbScYxbAhFcjQWgRinifoymYHeuXzqIoQXfpUVYGR8/preview'>
                    Give feedback
                </StyledCardLink>
            }
        >
            {children}
        </StyledCard>
    );
};
