import { Badge, Box } from '@mui/material';
import type { IFeatureChange } from '../changeRequest.types';

export const ChangeRequestDraftStatusBadge = ({
    change,
}: {
    change: IFeatureChange | undefined;
}) => {
    return (
        <Box sx={{ mr: 1.5 }}>
            {change?.action === 'updateStrategy' ? (
                <Badge color='warning'>Modified in draft</Badge>
            ) : change?.action === 'deleteStrategy' ? (
                <Badge color='error'>Deleted in draft</Badge>
            ) : null}
        </Box>
    );
};
