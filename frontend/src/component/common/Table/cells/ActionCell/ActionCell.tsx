import { Box, Divider, styled } from '@mui/material';
import { FC, VFC } from 'react';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(0, 1.5),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    borderColor: theme.palette.divider,
    height: theme.spacing(3),
    margin: theme.spacing(0, 2),
}));

const ActionCellDivider: VFC = () => (
    <StyledDivider orientation="vertical" variant="middle" />
);

const ActionCellComponent: FC & {
    Divider: typeof ActionCellDivider;
} = ({ children }) => {
    return <StyledContainer>{children}</StyledContainer>;
};

ActionCellComponent.Divider = ActionCellDivider;

export const ActionCell = ActionCellComponent;
