import { Tooltip } from '@material-ui/core';
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
        >
            <span>{formatDateYMD(time, locationSettings.locale)}</span>
        </Tooltip>
    );
};

export default CreatedAt;
