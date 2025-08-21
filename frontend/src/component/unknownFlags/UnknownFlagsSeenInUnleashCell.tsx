import type { UnknownFlag } from './hooks/useUnknownFlags.js';
import { Link } from 'react-router-dom';
import {
    TimeAgoCell,
    type ITimeAgoCellProps,
} from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell.js';
import AccessContext from 'contexts/AccessContext.js';
import { useContext } from 'react';

interface IUnknownFlagsSeenInUnleashCellProps extends ITimeAgoCellProps {
    unknownFlag: UnknownFlag;
}

export const UnknownFlagsSeenInUnleashCell = ({
    unknownFlag,
    ...props
}: IUnknownFlagsSeenInUnleashCellProps) => {
    const { isAdmin } = useContext(AccessContext);
    const value = unknownFlag.lastEventAt;

    const TimeAgo = <TimeAgoCell value={value} {...props} />;

    if (value && isAdmin) {
        return (
            <Link
                to={`/history?feature=${encodeURIComponent(`IS:${unknownFlag.name}`)}`}
            >
                {TimeAgo}
            </Link>
        );
    }

    return TimeAgo;
};
