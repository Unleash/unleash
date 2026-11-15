import { IconButton, Tooltip } from '@mui/material';
import IosShare from '@mui/icons-material/IosShare';
import type { FC } from 'react';
import { useEventTracker } from 'hooks/useEventTracker';

export const ExportFlags: FC<{ onClick: () => void; disabled?: boolean }> = ({
    onClick,
    disabled,
}) => {
    const { trackEvent } = useEventTracker();

    return (
        <Tooltip title='Export flags' arrow>
            <span>
                <IconButton
                    aria-label='Export flags'
                    disabled={disabled}
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
            </span>
        </Tooltip>
    );
};
