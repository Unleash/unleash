import { Badge } from '@mui/material';
import type { IFeatureChange } from '../changeRequest.types';

export const ChangeRequestDraftStatusBadge = ({
    changeAction,
}: {
    changeAction: IFeatureChange['action'];
}) => {
    switch (changeAction) {
        case 'updateStrategy':
            return <Badge color='warning'>Modified in draft</Badge>;
        case 'deleteStrategy':
            return <Badge color='error'>Deleted in draft</Badge>;
        default:
            return null;
    }
};
