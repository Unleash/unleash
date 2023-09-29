import { styled } from '@mui/material';
import { textTruncated } from 'themes/themeStyles';
import { Link } from 'react-router-dom';

export const FlexRow = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
});

export const StyledDetail = styled('div')(({ theme }) => ({
    justifyContent: 'center',
    paddingTop: theme.spacing(0.75),
    ...textTruncated,
}));

export const StyledLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
}));

export const StyledLink = styled(Link)(({ theme }) => ({
    maxWidth: '100%',
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));
