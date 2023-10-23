import { VFC } from 'react';
import { styled, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const StyledLink = styled('a')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    border: `1px dashed ${theme.palette.secondary.border}`,
    textDecoration: 'none',
    color: 'inherit',
    background: theme.palette.background.elevation1,
    ':hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledAction = styled(Typography)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
    paddingTop: theme.spacing(3),
    gap: theme.spacing(0.5),
}));

export const RequestIntegrationCard: VFC = () => (
    <StyledLink
        href='https://docs.google.com/forms/d/e/1FAIpQLScR1_iuoQiKq89c0TKtj0gM02JVWyQ2hQ-YchBMc2GRrGf7uw/viewform'
        target='_blank'
        rel='noopener noreferrer'
    >
        <Typography variant='body2' color='text.secondary' data-loading>
            Are we missing an integration that you need?
        </Typography>
        <Typography variant='body2' color='text.secondary' data-loading>
            Go ahead and request it!
        </Typography>
        <StyledAction data-loading>
            <AddIcon />
            Request integration
        </StyledAction>
    </StyledLink>
);
