import { FC } from 'react';

import CheckBox from '@mui/icons-material/Check';
import Today from '@mui/icons-material/Today';
import { MultiActionButton } from '../MultiActionButton/MultiActionButton';
import { APPLY_CHANGE_REQUEST } from 'component/providers/AccessProvider/permissions';

export const ApplyButton: FC<{
    disabled: boolean;
    onSchedule: () => void;
    onApply: () => void;
}> = ({ disabled, onSchedule, onApply, children }) => (
    <MultiActionButton
        permission={APPLY_CHANGE_REQUEST}
        disabled={disabled}
        actions={[
            {
                label: 'Apply changes',
                onSelect: onApply,
                icon: <CheckBox fontSize='small' />,
            },
            {
                label: 'Schedule changes',
                onSelect: onSchedule,
                icon: <Today fontSize='small' />,
            },
        ]}
    >
        {children}
    </MultiActionButton>
);
