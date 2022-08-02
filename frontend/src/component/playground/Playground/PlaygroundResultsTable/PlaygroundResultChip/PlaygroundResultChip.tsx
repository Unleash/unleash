import { Chip, styled, useTheme } from '@mui/material';
import { colors } from '../../../../../themes/colors';
import { ConditionallyRender } from '../../../../common/ConditionallyRender/ConditionallyRender';
import React from 'react';
import { ReactComponent as FeatureEnabledIcon } from '../../../../../assets/icons/isenabled-true.svg';
import { ReactComponent as FeatureDisabledIcon } from '../../../../../assets/icons/isenabled-false.svg';

interface IResultChipProps {
    enabled: boolean | 'unevaluated';
    // Result icon - defaults to true
    showIcon?: boolean;
    label?: string;
}

export const StyledChip = styled(Chip)(({ theme }) => ({
    width: 60,
    height: 24,
    borderRadius: theme.shape.borderRadius,
    fontWeight: theme.typography.fontWeightMedium,
    ['& .MuiChip-label']: {
        padding: 0,
        paddingLeft: theme.spacing(0.5),
    },
}));

export const StyledFalseChip = styled(StyledChip)(({ theme }) => ({
    border: `1px solid ${theme.palette.error.main}`,
    backgroundColor: colors.red['200'],
    ['& .MuiChip-label']: {
        color: theme.palette.error.main,
    },
    ['& .MuiChip-icon']: {
        color: theme.palette.error.main,
    },
}));

export const StyledTrueChip = styled(StyledChip)(({ theme }) => ({
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
            condition={Boolean(enabled)}
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
            condition={Boolean(enabled)}
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
