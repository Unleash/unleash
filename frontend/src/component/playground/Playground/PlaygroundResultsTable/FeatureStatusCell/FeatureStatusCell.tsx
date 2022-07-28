import React from 'react';
import { colors } from 'themes/colors';
import { ReactComponent as FeatureEnabledIcon } from 'assets/icons/isenabled-true.svg';
import { ReactComponent as FeatureDisabledIcon } from 'assets/icons/isenabled-false.svg';
import { Box, Chip, styled, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
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
                <PlaygroundResultChip enabled />
            </StyledChipWrapper>
        </StyledCellBox>
    );
};
