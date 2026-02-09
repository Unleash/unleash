import { Box, IconButton, Tooltip } from '@mui/material';

import CopyIcon from '@mui/icons-material/FileCopy';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';

type IApiUrlProps = {
    title: string;
    url: string;
};

export const ApiUrl: React.FC<IApiUrlProps> = ({ title, url }) => {
    const { setToastData } = useToast();
    const onCopyToClipboard = (url: string) => () => {
        copy(url);
        setToastData({
            type: 'success',
            text: 'Copied to clipboard',
        });
    };

    return (
        <>
            <Box>
                <strong>{title}</strong>
            </Box>
            <Box>
                <pre style={{ display: 'inline' }}>{url}</pre>
            </Box>
            <Box>
                <Tooltip title='Copy URL' arrow>
                    <IconButton onClick={onCopyToClipboard(url)} size='small'>
                        <CopyIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </>
    );
};
