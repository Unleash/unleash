import { useRef, useState } from 'react';
import type { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { IconButton, Popover, styled } from '@mui/material';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { FeatureDetails } from './FeatureDetails/FeatureDetails.tsx';
import { PlaygroundResultFeatureStrategyList } from './FeatureStrategyList/PlaygroundResultsFeatureStrategyList.tsx';

interface FeatureResultInfoPopoverCellProps {
    feature: PlaygroundFeatureSchema;
    input?: PlaygroundRequestSchema;
}

const FeatureResultPopoverWrapper = styled('div')(({ theme }) => ({
    alignItems: 'flex-end',
    color: theme.palette.divider,
}));

export const NewFeatureResultInfoPopoverCell = ({
    feature,
    input,
}: FeatureResultInfoPopoverCellProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const togglePopover = () => {
        setOpen(!open);
    };

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
                    sx: (theme) => ({
                        '--popover-inline-padding': theme.spacing(4),
                        paddingInline: 'var(--popover-inline-padding)',
                        paddingBlock: theme.spacing(3),
                        display: 'flex',
                        flexDirection: 'column',
                        width: 728,
                        maxWidth: '100%',
                        height: 'auto',
                        gap: theme.spacing(3),
                        overflowY: 'auto',
                        backgroundColor: theme.palette.background.elevation1,
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

export const FeatureResultInfoPopoverCell = (
    props: FeatureResultInfoPopoverCellProps,
) => {
    if (!props.feature) {
        return null;
    }

    return <NewFeatureResultInfoPopoverCell {...props} />;
};
