import { IChangeRequestApproval } from '../../changeRequest.types';
import { FC } from 'react';
import { Typography } from '@mui/material';
import { ChangeRequestRejector } from './ChangeRequestReviewer';

interface ChangeRequestRejectionProps {
    rejections: IChangeRequestApproval[];
}

export const ChangeRequestRejections: FC<ChangeRequestRejectionProps> = ({
    rejections = [],
}) => (
    <>
        <Typography variant='body1' color='text.secondary'>
            Rejected by
        </Typography>
        {rejections.map((rejector) => (
            <ChangeRequestRejector
                key={rejector.createdBy.username}
                name={rejector.createdBy.username || 'Unknown user'}
                imageUrl={rejector.createdBy.imageUrl}
            />
        ))}
    </>
);
