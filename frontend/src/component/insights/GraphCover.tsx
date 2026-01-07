import { styled } from '@mui/material';
import type { FC, PropsWithChildren } from 'react';

const StyledCover = styled('div')(({ theme }) => ({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    zIndex: theme.zIndex.appBar,
    '&::before': {
        zIndex: theme.zIndex.fab,
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.palette.background.paper,
        opacity: 0.8,
    },
}));

const StyledCoverContent = styled('div')(({ theme }) => ({
    zIndex: theme.zIndex.modal,
    margin: 'auto',
    color: theme.palette.text.secondary,
    textAlign: 'center',
}));

export const GraphCover: FC<PropsWithChildren> = ({ children }) => {
    return (
        <StyledCover>
            <StyledCoverContent>{children}</StyledCoverContent>
        </StyledCover>
    );
};
