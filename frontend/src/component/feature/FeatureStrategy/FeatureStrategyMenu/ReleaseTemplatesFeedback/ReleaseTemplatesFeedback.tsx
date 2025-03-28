import type { FC } from 'react';
import { styled, Link } from '@mui/material';
import type { Link as RouterLink } from 'react-router-dom';
import { RELEASE_TEMPLATE_FEEDBACK } from 'constants/links';

const StyledLink = styled(Link<typeof RouterLink | 'a'>)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.links,
    fontWeight: theme.typography.fontWeightMedium,
    textDecoration: 'none',
    marginRight: 'auto',
}));

export const ReleaseTemplatesFeedback: FC = () => (
    <StyledLink
        component='a'
        href={RELEASE_TEMPLATE_FEEDBACK}
        underline='hover'
        rel='noopener noreferrer'
        target='_blank'
    >
        Give feedback to release templates
    </StyledLink>
);
