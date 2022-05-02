import { Tooltip } from '@mui/material';
import { Info } from '@mui/icons-material';
import { useStyles } from 'component/common/HelpIcon/HelpIcon.styles';
import React from 'react';

interface IHelpIconProps {
    tooltip: string;
    style?: React.CSSProperties;
}

export const HelpIcon = ({ tooltip, style }: IHelpIconProps) => {
    const { classes: styles } = useStyles();

    return (
        <Tooltip title={tooltip} arrow>
            <span
                className={styles.container}
                style={style}
                tabIndex={0}
                role="tooltip"
                aria-label="Help"
            >
                <Info className={styles.icon} />
            </span>
        </Tooltip>
    );
};
