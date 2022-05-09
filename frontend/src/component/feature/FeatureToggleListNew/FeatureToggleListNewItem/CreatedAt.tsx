import { Tooltip } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD, formatDateYMDHMS } from 'utils/formatDate';

interface ICreatedAtProps {
    time: string;
}

const CreatedAt = ({ time }: ICreatedAtProps) => {
    const { locationSettings } = useLocationSettings();

    return (
        <Tooltip
            title={`Created at ${formatDateYMDHMS(
                time,
                locationSettings.locale
            )}`}
            arrow
        >
            <span>{formatDateYMD(time, locationSettings.locale)}</span>
        </Tooltip>
    );
};

export default CreatedAt;
