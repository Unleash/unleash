import { useRef, useState } from 'react';
import type { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { IconButton, Popover, styled } from '@mui/material';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { FeatureDetails as LegacyFeatureDetails } from './FeatureDetails/LegacyFeatureDetails';
import { PlaygroundResultFeatureStrategyList as LegacyPlaygroundResultFeatureStrategyList } from './FeatureStrategyList/LegacyPlaygroundResultFeatureStrategyList';
import { useUiFlag } from 'hooks/useUiFlag';
import { FeatureDetails } from './FeatureDetails/FeatureDetails';
import { PlaygroundResultFeatureStrategyList } from './FeatureStrategyList/PlaygroundResultsFeatureStrategyList';

interface FeatureResultInfoPopoverCellProps {
    feature: PlaygroundFeatureSchema;
    input?: PlaygroundRequestSchema;
}

const FeatureResultPopoverWrapper = styled('div')(({ theme }) => ({
    alignItems: 'flex-end',
    color: theme.palette.divider,
}));

const DetailsPadding = styled('div')(({ theme }) => ({
    paddingInline: theme.spacing(4),
}));

export const FeatureResultInfoPopoverCell = ({
    feature,
    input,
}: FeatureResultInfoPopoverCellProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const useNewStrategyDesign = useUiFlag('flagOverviewRedesign');

    const togglePopover = () => {
        setOpen(!open);
    };

    if (!feature) {
        return null;
    }

    const paperProps = useNewStrategyDesign
        ? {
              sx: (theme) => ({
                  display: 'flex',
                  flexDirection: 'column',
                  paddingBlock: theme.spacing(4),
                  width: 728,
                  maxWidth: '100%',
                  height: 'auto',
                  overflowY: 'auto',
                  backgroundColor: theme.palette.background.elevation1,
                  borderRadius: theme.shape.borderRadius,
              }),
          }
        : {
              sx: (theme) => ({
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
                PaperProps={paperProps}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
            >
                {useNewStrategyDesign ? (
                    <>
                        <DetailsPadding>
                            <FeatureDetails
                                feature={feature}
                                input={input}
                                onClose={() => setOpen(false)}
                            />
                        </DetailsPadding>
                        <PlaygroundResultFeatureStrategyList
                            feature={feature}
                            input={input}
                        />
                    </>
                ) : (
                    <>
                        <LegacyFeatureDetails
                            feature={feature}
                            input={input}
                            onClose={() => setOpen(false)}
                        />
                        <LegacyPlaygroundResultFeatureStrategyList
                            feature={feature}
                            input={input}
                        />
                    </>
                )}
            </Popover>
        </FeatureResultPopoverWrapper>
    );
};
