import { VFC } from 'react';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { resolveChangeRequestStatusIcon } from 'component/changeRequest/changeRequest.utils';
import { ChangeRequestState } from 'component/changeRequest/changeRequest.types';

interface IChangeRequestStatusCellProps {
    value?: string | null;
}

export const ChangeRequestStatusCell: VFC<IChangeRequestStatusCellProps> = ({
    value,
}) => {
    const renderState = () => {
        if (!value) return null;
        return resolveChangeRequestStatusIcon(value as ChangeRequestState);
    };

    if (!value) {
        return <TextCell />;
    }

    return <TextCell>{renderState()}</TextCell>;
};
