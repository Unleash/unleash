import { ChangeRequestState } from './changeRequest.types';
import { Badge } from 'component/common/Badge/Badge';
import { Check, CircleOutlined, Close } from '@mui/icons-material';

export const resolveChangeRequestStatusIcon = (state: ChangeRequestState) => {
    const reviewRequired = (
        <Badge color="secondary" icon={<CircleOutlined fontSize={'small'} />}>
            Review required
        </Badge>
    );
    switch (state) {
        case 'Draft':
            return reviewRequired;
        case 'In review':
            return reviewRequired;
        case 'Approved':
            return (
                <Badge color="success" icon={<Check fontSize={'small'} />}>
                    Approved
                </Badge>
            );
        case 'Applied':
            return (
                <Badge color="success" icon={<Check fontSize={'small'} />}>
                    Applied
                </Badge>
            );
        case 'Cancelled':
            return (
                <Badge
                    color="error"
                    icon={<Close fontSize={'small'} sx={{ mr: 8 }} />}
                >
                    Cancelled
                </Badge>
            );
        default:
            return reviewRequired;
    }
};
