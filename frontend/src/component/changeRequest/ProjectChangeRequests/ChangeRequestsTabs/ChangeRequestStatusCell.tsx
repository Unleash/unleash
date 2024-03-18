import type { VFC } from 'react';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import type { ChangeRequestType } from 'component/changeRequest/changeRequest.types';
import { ChangeRequestStatusBadge } from 'component/changeRequest/ChangeRequestStatusBadge/ChangeRequestStatusBadge';

interface IChangeRequestStatusCellProps {
    value?: string | null; // FIXME: proper type
    row: { original: ChangeRequestType };
}

export const ChangeRequestStatusCell: VFC<IChangeRequestStatusCellProps> = ({
    value,
    row: { original },
}) => {
    const renderState = () => {
        if (!value) return null;
        return <ChangeRequestStatusBadge changeRequest={original} />;
    };

    if (!value) {
        return <TextCell />;
    }

    return <TextCell>{renderState()}</TextCell>;
};
