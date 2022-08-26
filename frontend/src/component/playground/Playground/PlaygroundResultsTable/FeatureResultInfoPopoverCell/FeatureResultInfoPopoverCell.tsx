import {
    PlaygroundFeatureSchema,
    PlaygroundRequestSchema,
} from 'component/playground/Playground/interfaces/playground.model';
import { IconButton, Popover, styled } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import React, { useRef, useState } from 'react';
import { useStyles } from './FeatureResultInfoPopoverCell.styles';
import { FeatureDetails } from './FeatureDetails/FeatureDetails';
import { PlaygroundResultFeatureStrategyList } from './FeatureStrategyList/PlaygroundResultFeatureStrategyList';

interface FeatureResultInfoPopoverCellProps {
    feature: PlaygroundFeatureSchema;
    input?: PlaygroundRequestSchema;
}

const FeatureResultPopoverWrapper = styled('div')(({ theme }) => ({
    alignItems: 'flex-end',
    color: theme.palette.tertiary.main,
}));

export const FeatureResultInfoPopoverCell = ({
    feature,
    input,
}: FeatureResultInfoPopoverCellProps) => {
    const [open, setOpen] = useState(false);
    const { classes: styles } = useStyles();
    const ref = useRef(null);

    const togglePopover = () => {
        setOpen(!open);
    };

    if (!feature) {
        return null;
    }

    return (
        <FeatureResultPopoverWrapper>
            <IconButton onClick={togglePopover}>
                <InfoOutlined ref={ref} />
            </IconButton>
            <Popover
                open={open}
                onClose={() => setOpen(false)}
                anchorEl={ref.current}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
                classes={{ paper: styles.popoverPaper }}
            >
                <FeatureDetails
                    feature={feature}
                    input={input}
                    onClose={() => setOpen(false)}
                />
                <PlaygroundResultFeatureStrategyList
                    feature={feature}
                    input={input}
                />
            </Popover>
        </FeatureResultPopoverWrapper>
    );
};
