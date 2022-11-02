import { VFC } from 'react';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { ChangeRequestState } from 'component/changeRequest/changeRequest.types';
import { ChangeRequestStatusBadge } from 'component/changeRequest/ChangeRequestStatusBadge/ChangeRequestStatusBadge';

interface IChangeRequestStatusCellProps {
    value?: string | null; // FIXME: proper type
}

export const ChangeRequestStatusCell: VFC<IChangeRequestStatusCellProps> = ({
    value,
}) => {
    const renderState = () => {
        if (!value) return null;
        return <ChangeRequestStatusBadge state={value as ChangeRequestState} />;
    };

    if (!value) {
        return <TextCell />;
    }

    return <TextCell>{renderState()}</TextCell>;
};
