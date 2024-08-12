import type { FC } from 'react';
import { Typography } from '@mui/material';
import { ChangeRequestApprover } from './ChangeRequestReviewer';
import type { IChangeRequestApproval } from '../../changeRequest.types';

interface ChangeRequestApprovalProps {
    approvals: IChangeRequestApproval[];
}

export const ChangeRequestApprovals: FC<ChangeRequestApprovalProps> = ({
    approvals = [],
}) => (
    <>
        <Typography variant='body1' color='text.secondary'>
            {approvals?.length > 0 ? 'Approved by' : 'No approvals yet'}
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
