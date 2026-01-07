import { useState, type FC } from 'react';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';
import { useKeyboardCopy } from 'hooks/useKeyboardCopy';
import { IconButton, Tooltip } from '@mui/material';
import Check from '@mui/icons-material/Check';
import FileCopyOutlined from '@mui/icons-material/FileCopyOutlined';

const iconSize = 18 / 8;

export const FeatureCopyName: FC<{ name: string }> = ({ name }) => {
    const [isFeatureNameCopied, setIsFeatureNameCopied] = useState(false);
    const { setToastData } = useToast();

    const handleCopyToClipboard = () => {
        try {
            copy(name);
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

    const shortcutDescription = useKeyboardCopy(handleCopyToClipboard);

    return (
        <Tooltip
            title={
                isFeatureNameCopied
                    ? 'Copied!'
                    : `Copy name (${shortcutDescription})`
            }
            arrow
        >
            <IconButton onClick={handleCopyToClipboard}>
                {isFeatureNameCopied ? (
                    <Check
                        sx={(theme) => ({
                            fontSize: theme.spacing(iconSize),
                            color: theme.palette.success.main,
                        })}
                    />
                ) : (
                    <FileCopyOutlined
                        sx={(theme) => ({ fontSize: theme.spacing(iconSize) })}
                    />
                )}
            </IconButton>
        </Tooltip>
    );
};
