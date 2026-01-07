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

export const UnknownFlagsLastEventCell = ({
    unknownFlag,
    ...props
}: IUnknownFlagsSeenInUnleashCellProps) => {
    const { isAdmin } = useContext(AccessContext);
    const value = unknownFlag.lastEventAt;
    const title = value
        ? (date) => `Last event: ${date}`
        : () => 'This flag has never existed in Unleash';

    const TimeAgo = <TimeAgoCell value={value} title={title} {...props} />;

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
