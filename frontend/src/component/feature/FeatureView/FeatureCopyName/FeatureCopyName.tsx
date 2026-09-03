import { useState, type FC } from 'react';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';
import { useKeyboardCopy } from 'hooks/useKeyboardCopy';
import { useTracking } from 'hooks/useTracking';
import { flagNameCopiedTracking } from 'component/feature/flagActionsTracking';
import { IconButton, Tooltip } from '@mui/material';
import Check from '@mui/icons-material/Check';
import FileCopyOutlined from '@mui/icons-material/FileCopyOutlined';

export const FeatureCopyName: FC<{ name: string }> = ({ name }) => {
    const [isFeatureNameCopied, setIsFeatureNameCopied] = useState(false);
    const { setToastData } = useToast();
    const { track } = useTracking(flagNameCopiedTracking);

    const handleCopyToClipboard = (method: 'button' | 'keyboard-shortcut') => {
        try {
            // copy() reports failure by returning false, not by throwing
            if (copy(name)) {
                track('copied', { method, name });
            }
            setIsFeatureNameCopied(true);
            const timeout = setTimeout(() => {
                setIsFeatureNameCopied(false);
            }, 3000);

            return () => {
                clearTimeout(timeout);
            };
        } catch (_error: unknown) {
            setToastData({
                type: 'error',
                text: 'Could not copy feature name',
            });
        }
    };

    const shortcutDescription = useKeyboardCopy(() =>
        handleCopyToClipboard('keyboard-shortcut'),
    );

    return (
        <Tooltip
            title={
                isFeatureNameCopied
                    ? 'Copied!'
                    : `Copy name (${shortcutDescription})`
            }
            arrow
        >
            <IconButton
                size='medium'
                onClick={() => handleCopyToClipboard('button')}
            >
                {isFeatureNameCopied ? <Check /> : <FileCopyOutlined />}
            </IconButton>
        </Tooltip>
    );
};
