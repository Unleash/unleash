import { useRef, useState } from 'react';
import { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { IconButton, Popover, styled } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { FeatureDetails } from './FeatureDetails/FeatureDetails';
import { PlaygroundResultFeatureStrategyList } from './FeatureStrategyList/PlaygroundResultFeatureStrategyList';

interface FeatureResultInfoPopoverCellProps {
    feature: PlaygroundFeatureSchema;
    input?: PlaygroundRequestSchema;
}

const FeatureResultPopoverWrapper = styled('div')(({ theme }) => ({
    alignItems: 'flex-end',
    color: theme.palette.divider,
}));

export const FeatureResultInfoPopoverCell = ({
    feature,
    input,
}: FeatureResultInfoPopoverCellProps) => {
    const [open, setOpen] = useState(false);
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
                PaperProps={{
                    sx: theme => ({
                        display: 'flex',
                        flexDirection: 'column',
                        padding: theme.spacing(6),
                        width: 728,
                        maxWidth: '100%',
                        height: 'auto',
                        overflowY: 'auto',
                        backgroundColor: theme.palette.background.elevation2,
                        borderRadius: theme.shape.borderRadius,
                    }),
                }}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
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
