import {Box, Chip, styled} from "@mui/material";
import {colors} from "../../../../../themes/colors";
import {ConditionallyRender} from "../../../../common/ConditionallyRender/ConditionallyRender";
import React, {ReactElement} from "react";

interface IResultChipProps {
    enabled: boolean;
    icon?: ReactElement;
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

export const ResultChip = ({ enabled, icon, label}: IResultChipProps) => {
    return (
        <ConditionallyRender
            condition={enabled}
            show={<StyledTrueChip icon={Boolean(icon) ? icon : undefined} label={label}/>}
            elseShow={<StyledFalseChip icon={Boolean(icon) ? icon : undefined} label={label}/>}
        />
    );
}
