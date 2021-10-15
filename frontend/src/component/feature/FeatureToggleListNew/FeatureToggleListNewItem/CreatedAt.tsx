import { Tooltip } from '@material-ui/core';
import { connect } from 'react-redux';
import { formatDateWithLocale, formatFullDateTimeWithLocale } from '../../../common/util';

interface CreatedAtProps {
    time: Date;
    //@ts-ignore
    location: any;
}

const CreatedAt = ({time, location}: CreatedAtProps) => {
    return (
        <Tooltip title={`Created at ${formatFullDateTimeWithLocale(time, location.locale)}`}>
            <span>
                {formatDateWithLocale(time, location.locale)}
            </span>
        </Tooltip>
    );
}

const mapStateToProps = (state: any) => ({
    location: state.settings.toJS().location,
});

export default connect(mapStateToProps)(CreatedAt);