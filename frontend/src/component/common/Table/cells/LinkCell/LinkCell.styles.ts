import { Link, styled, Theme } from '@mui/material';
import { ComponentType } from 'react';

export const wrapperStyles = (theme: Theme) => ({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    minHeight: '62px',
});

export const StyledWrapper = styled('div')(({ theme }) => wrapperStyles(theme));

export const StyledLink = styled(Link)<{
    component?: ComponentType<any>;
    to?: string;
}>(({ theme }) => ({
    ...wrapperStyles(theme),
    '&:hover, &:focus': {
        textDecoration: 'none',
        '& > div > span:first-of-type': {
            textDecoration: 'underline',
        },
    },
}));

export const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    wordBreak: 'break-all',
}));

export const StyledTitle = styled('span')(({ theme }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
}));

export const StyledDescription = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    textDecoration: 'none',
    fontSize: 'inherit',
    WebkitLineClamp: 1,
    lineClamp: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
}));
