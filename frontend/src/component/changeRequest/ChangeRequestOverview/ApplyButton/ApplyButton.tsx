import { FC } from 'react';

import CheckBox from '@mui/icons-material/Check';
import Today from '@mui/icons-material/Today';
import { MultiActionButton } from '../MultiActionButton/MultiActionButton';
import { APPLY_CHANGE_REQUEST } from 'component/providers/AccessProvider/permissions';

export const ApplyButton: FC<{
    disabled: boolean;
    onSchedule: () => void;
    onApply: () => void;
    variant?: 'create' | 'update';
}> = ({ disabled, onSchedule, onApply, variant = 'create', children }) => (
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
                label:
                    variant === 'create'
                        ? 'Schedule changes'
                        : 'Update schedule',
                onSelect: onSchedule,
                icon: <Today fontSize='small' />,
            },
        ]}
    >
        {children}
    </MultiActionButton>
);
