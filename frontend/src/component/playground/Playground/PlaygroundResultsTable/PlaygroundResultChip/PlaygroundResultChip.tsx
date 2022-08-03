import { Chip, styled, useTheme } from '@mui/material';
import { colors } from '../../../../../themes/colors';
import { ConditionallyRender } from '../../../../common/ConditionallyRender/ConditionallyRender';
import React from 'react';
import { ReactComponent as FeatureEnabledIcon } from '../../../../../assets/icons/isenabled-true.svg';
import { ReactComponent as FeatureDisabledIcon } from '../../../../../assets/icons/isenabled-false.svg';

interface IResultChipProps {
    enabled: boolean | 'unknown';
    // Result icon - defaults to true
    showIcon?: boolean;
    label?: string;
    size?: 'default' | 'medium' | 'large';
}

export const StyledChip = styled(Chip)<{ width?: number }>(
    ({ theme, width }) => ({
        width: width ?? 60,
        height: 24,
        borderRadius: theme.shape.borderRadius,
        fontWeight: theme.typography.fontWeightMedium,
        ['& .MuiChip-label']: {
            padding: 0,
            paddingLeft: theme.spacing(0.5),
        },
    })
);

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

export const StyledUnknownChip = styled(StyledChip)(({ theme }) => ({
    border: `1px solid ${theme.palette.warning.main}`,
    backgroundColor: colors.orange['100'],
    ['& .MuiChip-label']: {
        color: theme.palette.warning.main,
    },
    ['& .MuiChip-icon']: {
        color: theme.palette.warning.main,
    },
}));

export const PlaygroundResultChip = ({
    enabled,
    showIcon = true,
    label,
    size = 'default',
}: IResultChipProps) => {
    const theme = useTheme();
    const icon = (
        <ConditionallyRender
            condition={enabled !== 'unknown' && enabled}
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

    let chipWidth = 60;
    if (size === 'medium') {
        chipWidth = 72;
    }

    if (size === 'large') {
        chipWidth = 100;
    }

    return (
        <ConditionallyRender
            condition={enabled !== 'unknown' && enabled}
            show={
                <StyledTrueChip
                    icon={showIcon ? icon : undefined}
                    label={label || defaultLabel}
                    width={chipWidth}
                />
            }
            elseShow={
                <ConditionallyRender
                    condition={enabled === 'unknown'}
                    show={
                        <StyledUnknownChip
                            label={label || 'Unknown'}
                            width={chipWidth}
                        />
                    }
                    elseShow={
                        <StyledFalseChip
                            icon={showIcon ? icon : undefined}
                            label={label || defaultLabel}
                            width={chipWidth}
                        />
                    }
                />
            }
        />
    );
};
