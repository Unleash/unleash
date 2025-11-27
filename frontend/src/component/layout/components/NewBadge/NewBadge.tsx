import { styled } from '@mui/material';

import { ReactComponent as NewReleasesIcon } from 'assets/icons/new-badge.svg';

const StyledBadgeContainer = styled('div')({
    marginLeft: '1ch',
    display: 'grid',
    placeItems: 'center',
});

export const NewBadge = () => (
    <StyledBadgeContainer>
        <NewReleasesIcon />
    </StyledBadgeContainer>
);
