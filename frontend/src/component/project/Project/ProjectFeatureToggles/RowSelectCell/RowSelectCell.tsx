import React from 'react';
import { Box, Checkbox, styled } from '@mui/material';
import { FC } from 'react';
import { BATCH_SELECT } from 'utils/testIds';

interface IRowSelectCellProps {
    onChange: (_?: unknown) => void;
    checked: boolean;
    title: string;
    noPadding?: boolean;
}

const StyledBoxCell = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
}));

export const RowSelectCell: FC<IRowSelectCellProps> = ({
    onChange,
    checked,
    title,
    noPadding,
}) => (
    <StyledBoxCell
        data-testid={BATCH_SELECT}
        sx={(theme) => ({ paddingLeft: noPadding ? 0 : theme.spacing(2) })}
    >
        <Checkbox
            onChange={onChange}
            title={title}
            checked={checked}
            data-loading
        />
    </StyledBoxCell>
);

export const MemoizedRowSelectCell = React.memo(RowSelectCell);
