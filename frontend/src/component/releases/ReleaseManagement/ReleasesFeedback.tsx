import { styled } from '@mui/material';
import { Card } from 'component/common/Card/Card';
import { RELEASE_TEMPLATE_FEEDBACK } from 'constants/links';
import { Link } from 'react-router-dom';

const StyledCardLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.links,
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

export const ReleasesFeedback: React.FC<{
    title: string;
    children: React.ReactNode;
}> = ({ title, children }: { title: string; children?: React.ReactNode }) => {
    return (
        <Card
            cardVariant='secondary'
            title={title}
            footer={
                <StyledCardLink
                    to={RELEASE_TEMPLATE_FEEDBACK}
                    target='_blank'
                    rel='noreferrer'
                >
                    Give feedback
                </StyledCardLink>
            }
        >
            {children}
        </Card>
    );
};
