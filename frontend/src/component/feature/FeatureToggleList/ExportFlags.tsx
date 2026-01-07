import { IconButton, Tooltip } from '@mui/material';
import IosShare from '@mui/icons-material/IosShare';
import type { FC } from 'react';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

export const ExportFlags: FC<{ onClick: () => void }> = ({ onClick }) => {
    const { trackEvent } = usePlausibleTracker();

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
                size='small'
            >
                <IosShare />
            </IconButton>
        </Tooltip>
    );
};
