import { Tooltip, Typography } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { VFC } from 'react';
import { formatDateYMD } from 'utils/formatDate';
import { TextCell } from '../TextCell/TextCell';
import TimeAgo from 'react-timeago';

interface ITimeAgoCellProps {
    value?: string | number | Date;
    live?: boolean;
    emptyText?: string;
}

export const TimeAgoCell: VFC<ITimeAgoCellProps> = ({
    value,
    live = false,
    emptyText,
}) => {
    const { locationSettings } = useLocationSettings();

    if (!value) return <TextCell>{emptyText}</TextCell>;

    return (
        <TextCell>
            <Tooltip
                title={`Last login: ${formatDateYMD(
                    value,
                    locationSettings.locale
                )}`}
                arrow
            >
                <Typography noWrap variant="body2" data-loading>
                    <TimeAgo date={new Date(value)} live={live} title={''} />
                </Typography>
            </Tooltip>
        </TextCell>
    );
};
