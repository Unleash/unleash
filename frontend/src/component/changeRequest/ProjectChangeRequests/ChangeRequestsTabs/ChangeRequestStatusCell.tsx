import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import {
    ChangeRequestStatusBadge,
    type IChangeRequestStatusBadgeProps,
} from 'component/changeRequest/ChangeRequestStatusBadge/ChangeRequestStatusBadge';
import type { FC } from 'react';

interface IChangeRequestStatusCellProps {
    value?: string | null; // FIXME: proper type
    row: {
        original: IChangeRequestStatusBadgeProps['changeRequest'];
    };
}

export const ChangeRequestStatusCell: FC<IChangeRequestStatusCellProps> = ({
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
