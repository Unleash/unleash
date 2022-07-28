import { Chip, styled, useTheme } from '@mui/material';
import { colors } from '../../../../../themes/colors';
import { ConditionallyRender } from '../../../../common/ConditionallyRender/ConditionallyRender';
import React from 'react';
import { ReactComponent as FeatureEnabledIcon } from '../../../../../assets/icons/isenabled-true.svg';
import { ReactComponent as FeatureDisabledIcon } from '../../../../../assets/icons/isenabled-false.svg';

interface IResultChipProps {
    enabled: boolean;
    // Result icon - defaults to true
    showIcon?: boolean;
    label?: string;
}

export const StyledFalseChip = styled(Chip)(({ theme }) => ({
    width: 80,
    borderRadius: '5px',
    border: `1px solid ${theme.palette.error.main}`,
    backgroundColor: colors.red['200'],
    ['& .MuiChip-label']: {
        color: theme.palette.error.main,
    },
    ['& .MuiChip-icon']: {
        color: theme.palette.error.main,
    },
}));

export const StyledTrueChip = styled(Chip)(({ theme }) => ({
    width: 80,
    borderRadius: '5px',
    border: `1px solid ${theme.palette.success.main}`,
    backgroundColor: colors.green['100'],
    ['& .MuiChip-label']: {
        color: theme.palette.success.main,
    },
    ['& .MuiChip-icon']: {
        color: theme.palette.success.main,
    },
}));

export const PlaygroundResultChip = ({
    enabled,
    showIcon = true,
    label,
}: IResultChipProps) => {
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

    const defaultLabel = enabled ? 'True' : 'False';

    return (
        <ConditionallyRender
            condition={enabled}
            show={
                <StyledTrueChip
                    icon={showIcon ? icon : undefined}
                    label={label || defaultLabel}
                />
            }
            elseShow={
                <StyledFalseChip
                    icon={showIcon ? icon : undefined}
                    label={label || defaultLabel}
                />
            }
        />
    );
};
