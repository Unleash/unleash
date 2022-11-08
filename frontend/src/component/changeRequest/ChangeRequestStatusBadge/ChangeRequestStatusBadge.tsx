import { VFC } from 'react';
import { ChangeRequestState } from '../changeRequest.types';
import { Badge } from 'component/common/Badge/Badge';
import { Check, CircleOutlined, Close } from '@mui/icons-material';

interface IChangeRequestStatusBadgeProps {
    state: ChangeRequestState;
}

const ReviewRequiredBadge: VFC = () => (
    <Badge color="secondary" icon={<CircleOutlined fontSize={'small'} />}>
        Review required
    </Badge>
);

const DraftBadge: VFC = () => <Badge color="warning">Draft</Badge>;

export const ChangeRequestStatusBadge: VFC<IChangeRequestStatusBadgeProps> = ({
    state,
}) => {
    switch (state) {
        case 'Draft':
            return <DraftBadge />;
        case 'In review':
            return <ReviewRequiredBadge />;
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
                <Badge color="error" icon={<Close fontSize={'small'} />}>
                    Cancelled
                </Badge>
            );
        default:
            return <ReviewRequiredBadge />;
    }
};
