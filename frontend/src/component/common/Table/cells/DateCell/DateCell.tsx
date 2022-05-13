import { VFC } from 'react';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD, formatDateYMDHMS } from 'utils/formatDate';
import { Box, Tooltip } from '@mui/material';
import { parseISO } from 'date-fns';

interface IDateCellProps {
    value?: Date | string | null;
}

export const DateCell: VFC<IDateCellProps> = ({ value }) => {
    const { locationSettings } = useLocationSettings();

    if (!value) {
        return <Box sx={{ py: 1.5, px: 2 }} />;
    }

    const date = value instanceof Date ? value : parseISO(value);

    return (
        <Box sx={{ py: 1.5, px: 2 }}>
            <Tooltip
                title={formatDateYMDHMS(date, locationSettings.locale)}
                arrow
            >
                <span data-loading role="tooltip">
                    {formatDateYMD(date, locationSettings.locale)}
                </span>
            </Tooltip>
        </Box>
    );
};
