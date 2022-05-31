import { styled } from '@mui/material';
import { FC } from 'react';

const StyledSpan = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    marginLeft: theme.spacing(1),
}));

export const GridColLink: FC = ({ children }) => {
    return <StyledSpan>({children})</StyledSpan>;
};
