import { Tooltip, TooltipProps } from '@mui/material';
import { Info } from '@mui/icons-material';
import { useStyles } from 'component/common/HelpIcon/HelpIcon.styles';
import React from 'react';

interface IHelpIconProps {
    tooltip: string;
    placement?: TooltipProps['placement'];
}

export const HelpIcon = ({ tooltip, placement }: IHelpIconProps) => {
    const { classes: styles } = useStyles();

    return (
        <Tooltip title={tooltip} placement={placement} arrow>
            <span className={styles.container} tabIndex={0} aria-label="Help">
                <Info className={styles.icon} />
            </span>
        </Tooltip>
    );
};
