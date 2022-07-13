import React from 'react';
import { colors } from 'themes/colors';
import { ReactComponent as FeatureEnabledIcon } from 'assets/icons/isenabled-true.svg';
import { ReactComponent as FeatureDisabledIcon } from 'assets/icons/isenabled-false.svg';
import { Box, Chip, styled, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IFeatureStatusCellProps {
    enabled: boolean;
}

const StyledFalseChip = styled(Chip)(({ theme }) => ({
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

const StyledTrueChip = styled(Chip)(({ theme }) => ({
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
                <ConditionallyRender
                    condition={enabled}
                    show={<StyledTrueChip icon={icon} label={label} />}
                    elseShow={<StyledFalseChip icon={icon} label={label} />}
                />
            </StyledChipWrapper>
        </StyledCellBox>
    );
};
