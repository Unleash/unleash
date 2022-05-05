import { VFC } from 'react';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD, formatDateYMDHMS } from 'utils/formatDate';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Tooltip } from '@mui/material';

interface IDateCellProps {
    value?: Date | null;
}

export const DateCell: VFC<IDateCellProps> = ({ value }) => {
    const { locationSettings } = useLocationSettings();

    return (
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
                    <span data-loading>
                        {formatDateYMD(value as Date, locationSettings.locale)}
                    </span>
                </Tooltip>
            }
        />
    );
};
