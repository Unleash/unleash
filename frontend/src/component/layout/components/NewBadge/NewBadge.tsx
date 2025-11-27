import { styled } from '@mui/material';

import { ReactComponent as NewReleasesIcon } from 'assets/icons/new-badge.svg';

const StyledBadgeContainer = styled('span')({
    width: '24px',
    height: '24px',
});

export const NewBadge = () => (
    <StyledBadgeContainer>
        <NewReleasesIcon />
    </StyledBadgeContainer>
);
