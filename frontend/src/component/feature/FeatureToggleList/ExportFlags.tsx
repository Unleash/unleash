import { IconButton, Tooltip } from '@mui/material';
import IosShare from '@mui/icons-material/IosShare';
import type { FC } from 'react';
import { useEventTracker } from 'hooks/useEventTracker';

export const ExportFlags: FC<{ onClick: () => void }> = ({ onClick }) => {
    const { trackEvent } = useEventTracker();

    return (
        <Tooltip title='Export flags' arrow>
            <IconButton
                onClick={() => {
                    onClick();
                    trackEvent('search-feature-buttons', {
                        props: {
                            action: 'export',
                        },
                    });
                }}
            >
                <IosShare />
            </IconButton>
        </Tooltip>
    );
};
