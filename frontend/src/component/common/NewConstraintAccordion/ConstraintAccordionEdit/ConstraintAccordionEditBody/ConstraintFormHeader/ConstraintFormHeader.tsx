import type React from 'react';
import { styled } from '@mui/material';

const StyledHeader = styled('h3')(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.typography.fontWeightRegular,
}));

// todo: move to project filter actions
export const ConstraintFormHeader: React.FC<
    React.HTMLAttributes<HTMLDivElement>
> = ({ children, ...rest }) => {
    return <StyledHeader {...rest}>{children}</StyledHeader>;
};
