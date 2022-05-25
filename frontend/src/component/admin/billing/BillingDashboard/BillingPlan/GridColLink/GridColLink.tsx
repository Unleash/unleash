import { styled } from '@mui/material';
import { FC } from 'react';

export const GridColLink: FC = ({ children }) => {
    return <StyledSpan>({children})</StyledSpan>;
};

const StyledSpan = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    marginLeft: theme.spacing(1),
}));
