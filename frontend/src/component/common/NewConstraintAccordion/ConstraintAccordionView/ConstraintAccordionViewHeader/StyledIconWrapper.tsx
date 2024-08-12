import { forwardRef, type ReactNode } from 'react';
import { styled } from '@mui/material';

export const StyledIconWrapperBase = styled('div')<{
    prefix?: boolean;
}>(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation2,
    width: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
}));

const StyledPrefixIconWrapper = styled(StyledIconWrapperBase)(({ theme }) => ({
    width: 'auto',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    marginLeft: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
}));

export const StyledIconWrapper = forwardRef<
    HTMLDivElement,
    { isPrefix?: boolean; children?: ReactNode }
>(({ isPrefix, ...props }, ref) =>
    isPrefix ? (
        <StyledPrefixIconWrapper ref={ref} {...props} />
    ) : (
        <StyledIconWrapperBase ref={ref} {...props} />
    ),
);
