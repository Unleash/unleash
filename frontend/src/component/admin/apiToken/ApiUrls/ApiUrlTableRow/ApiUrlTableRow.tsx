import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material';

import CopyIcon from '@mui/icons-material/FileCopy';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';

type ApiUrlTableRowProps = {
    title: string;
    url: string;
};

export const ApiUrlTableRow: React.FC<ApiUrlTableRowProps> = ({
    title,
    url,
}) => {
    const { setToastData } = useToast();
    const onCopyToClipboard = (url: string) => () => {
        copy(url);
        setToastData({
            type: 'success',
            text: 'Copied to clipboard',
        });
    };

    return (
        <TableRow>
            <TableCell component='th' scope='row'>
                {title}
            </TableCell>
            <TableCell>
                <pre style={{ display: 'inline' }}>{url}</pre>
            </TableCell>
            <TableCell align='center'>
                <Tooltip title='Copy URL' arrow>
                    <IconButton
                        onClick={onCopyToClipboard(url)}
                        size='small'
                        aria-label={`Copy ${title} to clipboard`}
                    >
                        <CopyIcon />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
};
