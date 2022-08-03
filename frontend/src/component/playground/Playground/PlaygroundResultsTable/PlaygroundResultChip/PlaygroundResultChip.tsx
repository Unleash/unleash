import { Chip, styled, useTheme } from '@mui/material';
import { colors } from '../../../../../themes/colors';
import { ConditionallyRender } from '../../../../common/ConditionallyRender/ConditionallyRender';
import React from 'react';
import { ReactComponent as FeatureEnabledIcon } from '../../../../../assets/icons/isenabled-true.svg';
import { ReactComponent as FeatureDisabledIcon } from '../../../../../assets/icons/isenabled-false.svg';
import { WarningOutlined } from "@mui/icons-material";

interface IResultChipProps {
    enabled: boolean | 'unevaluated' | 'unknown'
    label: string;
    // Result icon - defaults to true
    showIcon?: boolean;
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
    label,
    showIcon = true,
    size = 'default',
}: IResultChipProps) => {
    const theme = useTheme();
    const icon = (
        <ConditionallyRender
            condition={enabled === 'unknown' || enabled === 'unevaluated' }
            show={<WarningOutlined color={'warning'} fontSize='inherit' /> }
            elseShow={
                <ConditionallyRender
                    condition={typeof enabled === 'boolean' && Boolean(enabled)}
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
            }
        />
    );

    let  chipWidth = 60;
    if (size === 'medium') chipWidth = 72;
    if (size === 'large') chipWidth = 100;

    return (
        <ConditionallyRender
            condition={enabled === 'unknown' || enabled === 'unevaluated' }
            show={
                <StyledUnknownChip
                    icon={showIcon ? icon : undefined}
                    label={label}
                    width={chipWidth}
                />
            }
            elseShow={
                <ConditionallyRender
                    condition={typeof enabled === 'boolean' && Boolean(enabled)}
                    show={
                        <StyledTrueChip
                            icon={showIcon ? icon : undefined}
                            label={label}
                            width={chipWidth}
                        />
                    }
                    elseShow={
                        <StyledFalseChip
                            icon={showIcon ? icon : undefined}
                            label={label}
                            width={chipWidth}
                        />
                    }
                />
            }
        />
    )
};
