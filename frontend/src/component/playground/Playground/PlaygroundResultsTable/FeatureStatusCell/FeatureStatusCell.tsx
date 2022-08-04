import React from 'react';
import { Box, styled } from '@mui/material';
import { PlaygroundResultChip } from '../PlaygroundResultChip/PlaygroundResultChip';

interface IFeatureStatusCellProps {
    enabled: boolean;
}

const StyledCellBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
}));

const StyledChipWrapper = styled(Box)(() => ({
    marginRight: 'auto',
}));

export const FeatureStatusCell = ({ enabled }: IFeatureStatusCellProps) => {
    return (
        <StyledCellBox>
            <StyledChipWrapper data-loading>
                <PlaygroundResultChip
                    enabled={enabled}
                    label={enabled ? 'True' : 'False'}
                />
            </StyledChipWrapper>
        </StyledCellBox>
    );
};
