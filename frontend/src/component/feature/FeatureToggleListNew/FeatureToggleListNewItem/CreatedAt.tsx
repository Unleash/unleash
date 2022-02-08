import { Tooltip } from '@material-ui/core';
import { formatDateWithLocale, formatFullDateTimeWithLocale } from '../../../common/util';
import { useLocationSettings } from "../../../../hooks/useLocationSettings";

interface CreatedAtProps {
    time: Date;
}

const CreatedAt = ({time}: CreatedAtProps) => {
    const { locationSettings } = useLocationSettings();

    return (
        <Tooltip title={`Created at ${formatFullDateTimeWithLocale(time, locationSettings.locale)}`}>
            <span>
                {formatDateWithLocale(time, locationSettings.locale)}
            </span>
        </Tooltip>
    );
}

export default CreatedAt;
