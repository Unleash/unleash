import React from 'react';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { colors } from 'themes/colors';
import { ReactComponent as FeatureEnabledIcon } from 'assets/icons/isenabled-true.svg';
import { ReactComponent as FeatureDisabledIcon } from 'assets/icons/isenabled-false.svg';
import { Chip, styled, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IFeatureStatusCellProps {
    enabled: boolean;
}

const StyledFalseChip = styled(Chip)(() => ({
    width: 80,
    borderRadius: '5px',
    border: `1px solid ${colors.red['700']}`,
    backgroundColor: colors.red['200'],
    ['& .MuiChip-label']: {
        color: colors.red['700'],
    },
    ['& .MuiChip-icon']: {
        color: colors.red['700'],
    },
}));

const StyledTrueChip = styled(Chip)(() => ({
    width: 80,
    borderRadius: '5px',
    border: `1px solid ${colors.green['700']}`,
    backgroundColor: colors.green['100'],
    ['& .MuiChip-label']: {
        color: colors.green['700'],
    },
    ['& .MuiChip-icon']: {
        color: colors.green['700'],
    },
}));

export const FeatureStatusCell = ({ enabled }: IFeatureStatusCellProps) => {
    const theme = useTheme();
    const icon = (
        <ConditionallyRender
            condition={enabled}
            show={
                <FeatureEnabledIcon
                    stroke={theme.palette.success.main}
                    strokeWidth="0.25"
                />
            }
            elseShow={
                <FeatureDisabledIcon
                    stroke={theme.palette.error.main}
                    strokeWidth="0.25"
                />
            }
        />
    );

    const label = enabled ? 'True' : 'False';

    return (
        <TextCell>
            <ConditionallyRender
                condition={enabled}
                show={<StyledTrueChip icon={icon} label={label} />}
                elseShow={<StyledFalseChip icon={icon} label={label} />}
            />
        </TextCell>
    );
};
