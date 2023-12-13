import { VFC } from 'react';
import { IChangeRequest } from '../changeRequest.types';
import { Badge } from 'component/common/Badge/Badge';
import { AccessTime, Check, CircleOutlined, Close, Info } from "@mui/icons-material";

interface IChangeRequestStatusBadgeProps {
    changeRequest: IChangeRequest;
}

const ReviewRequiredBadge: VFC = () => (
    <Badge color='secondary' icon={<CircleOutlined fontSize={'small'} />}>
        Review required
    </Badge>
);

const DraftBadge: VFC = () => <Badge color='warning'>Draft</Badge>;

export const ChangeRequestStatusBadge: VFC<IChangeRequestStatusBadgeProps> = ({
                                                                                  changeRequest,
}) => {
    if (!changeRequest) {
        return null
    }
    const {state} = changeRequest;
    switch (state) {
        case 'Draft':
            return <DraftBadge />;
        case 'In review':
            return <ReviewRequiredBadge />;
        case 'Approved':
            return (
                <Badge color='success' icon={<Check fontSize={'small'} />}>
                    Approved
                </Badge>
            );
        case 'Applied':
            return (
                <Badge color='success' icon={<Check fontSize={'small'} />}>
                    Applied
                </Badge>
            );
        case 'Cancelled':
            return (
                <Badge color='error' icon={<Close fontSize={'small'} />}>
                    Cancelled
                </Badge>
            );
        case 'Rejected':
            return (
                <Badge color='error' icon={<Close fontSize={'small'} />}>
                    Rejected
                </Badge>
            );
        case 'Scheduled':
            const {schedule} = changeRequest;
            const color = schedule?.status === 'pending' ? 'warning' : 'error';
            const icon = schedule?.status === 'pending' ? <AccessTime fontSize={'small'} /> : <Info fontSize={'small'} />
            return (
                <Badge color={color} icon={icon}>
                    Scheduled
                </Badge>
            );
        default:
            return <ReviewRequiredBadge />;
    }
};
