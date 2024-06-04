import type React from 'react';
import type { FC } from 'react';

import CheckBox from '@mui/icons-material/Check';
import Today from '@mui/icons-material/Today';
import { APPLY_CHANGE_REQUEST } from 'component/providers/AccessProvider/permissions';
import { MultiActionButton } from 'component/common/MultiActionButton/MultiActionButton';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

export const ApplyButton: FC<{
    disabled: boolean;
    onSchedule: () => void;
    onApply: () => void;
    variant?: 'create' | 'update';
    children?: React.ReactNode;
}> = ({ disabled, onSchedule, onApply, variant = 'create', children }) => {
    const projectId = useRequiredPathParam('projectId');
    const id = useRequiredPathParam('id');
    const { data } = useChangeRequest(projectId, id);

    return (
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
            environmentId={data?.environment}
            projectId={projectId}
            ariaLabel='apply or schedule changes'
        >
            {children}
        </MultiActionButton>
    );
};
