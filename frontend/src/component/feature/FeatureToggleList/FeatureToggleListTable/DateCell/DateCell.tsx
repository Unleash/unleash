import { VFC } from 'react';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD, formatDateYMDHMS } from 'utils/formatDate';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Box, Tooltip } from '@mui/material';

interface IDateCellProps {
    value?: Date | null;
}

export const DateCell: VFC<IDateCellProps> = ({ value }) => {
    const { locationSettings } = useLocationSettings();

    return (
        <Box sx={{ py: 1.5, px: 2 }}>
            <ConditionallyRender
                condition={Boolean(value)}
                show={
                    <Tooltip
                        title={formatDateYMDHMS(
                            value as Date,
                            locationSettings.locale
                        )}
                        arrow
                    >
                        <span data-loading role="tooltip">
                            {formatDateYMD(
                                value as Date,
                                locationSettings.locale
                            )}
                        </span>
                    </Tooltip>
                }
            />
        </Box>
    );
};
