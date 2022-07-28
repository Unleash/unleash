import React from 'react';
import { colors } from 'themes/colors';
import { ReactComponent as FeatureEnabledIcon } from 'assets/icons/isenabled-true.svg';
import { ReactComponent as FeatureDisabledIcon } from 'assets/icons/isenabled-false.svg';
import { Box, Chip, styled, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {ResultChip} from "../ResultChip/ResultChip";

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
    const theme = useTheme();
    const icon = (
        <ConditionallyRender
            condition={enabled}
            show={
                <FeatureEnabledIcon
                    color={theme.palette.success.main}
                    strokeWidth="0.25"
                />
            }
            elseShow={
                <FeatureDisabledIcon
                    color={theme.palette.error.main}
                    strokeWidth="0.25"
                />
            }
        />
    );

    const label = enabled ? 'True' : 'False';

    return (
        <StyledCellBox>
            <StyledChipWrapper data-loading>
               <ResultChip enabled label={label} icon={icon} />
            </StyledChipWrapper>
        </StyledCellBox>
    );
};
