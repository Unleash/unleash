import { Badge } from 'component/common/Badge/Badge';
import type { IFeatureChange } from '../changeRequest.types';
import type { SxProps } from '@mui/material';

export const ChangeRequestDraftStatusBadge = ({
    changeAction,
    sx,
}: {
    changeAction: IFeatureChange['action'];
    sx?: SxProps;
}) => {
    switch (changeAction) {
        case 'updateStrategy':
            return (
                <Badge color='warning' sx={sx}>
                    Modified in draft
                </Badge>
            );
        case 'deleteStrategy':
            return (
                <Badge color='error' sx={sx}>
                    Deleted in draft
                </Badge>
            );
        default:
            return null;
    }
};
