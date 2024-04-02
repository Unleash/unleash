import React from 'react';
import { Box, Checkbox, styled } from '@mui/material';
import type { FC } from 'react';
import { BATCH_SELECT } from 'utils/testIds';

interface IRowSelectCellProps {
    onChange: (_?: unknown) => void;
    checked: boolean;
    title: string;
}

const StyledBoxCell = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
}));

export const RowSelectCell: FC<IRowSelectCellProps> = ({
    onChange,
    checked,
    title,
}) => (
    <StyledBoxCell data-testid={BATCH_SELECT}>
        <Checkbox
            onChange={onChange}
            title={title}
            checked={checked}
            data-loading
        />
    </StyledBoxCell>
);

export const MemoizedRowSelectCell = React.memo(RowSelectCell);
