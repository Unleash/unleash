import { styled } from '@mui/material';
import { Link } from 'react-router';

export const QuietLink = styled(Link)({
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
});
