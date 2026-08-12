import { styled } from '@mui/material';
import { Link } from 'react-router';

export const StyledLink = styled(Link)({
    maxWidth: '100%',
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
});
