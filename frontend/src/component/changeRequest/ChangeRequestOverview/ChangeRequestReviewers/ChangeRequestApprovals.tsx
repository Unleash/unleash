import type { FC } from 'react';
import { Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ChangeRequestApprover } from './ChangeRequestReviewer.tsx';
import type { IChangeRequestApproval } from '../../changeRequest.types';

interface ChangeRequestApprovalProps {
    approvals: IChangeRequestApproval[];
}

export const ChangeRequestApprovals: FC<ChangeRequestApprovalProps> = ({
    approvals = [],
}) => (
    <>
        <Typography variant='body1' color='text.secondary'>
            <ConditionallyRender
                condition={approvals?.length > 0}
                show={'Approved by'}
                elseShow={'No approvals yet'}
            />
        </Typography>
        {approvals.map((approver) => (
            <ChangeRequestApprover
                key={approver.createdBy.username}
                name={approver.createdBy.username || 'Unknown user'}
                imageUrl={approver.createdBy.imageUrl}
            />
        ))}
    </>
);
