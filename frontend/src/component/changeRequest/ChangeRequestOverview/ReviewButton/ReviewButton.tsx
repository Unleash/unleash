import { FC } from 'react';

import CheckBox from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';
import { MultiActionButton } from '../MultiActionButton/MultiActionButton';
import { APPROVE_CHANGE_REQUEST } from 'component/providers/AccessProvider/permissions';

export const ReviewButton: FC<{
    disabled: boolean;
    onReject: () => void;
    onApprove: () => void;
}> = ({ disabled, onReject, onApprove, children }) => (
    <MultiActionButton
        permission={APPROVE_CHANGE_REQUEST}
        disabled={disabled}
        actions={[
            {
                label: 'Approve',
                onSelect: onApprove,
                icon: <CheckBox fontSize='small' />,
            },
            {
                label: 'Reject',
                onSelect: onReject,
                icon: <Clear fontSize='small' />,
            },
        ]}
    >
        {children}
    </MultiActionButton>
);
