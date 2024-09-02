import type { VFC } from 'react';
import type { ChangeRequestType } from '../changeRequest.types';
import { Badge } from 'component/common/Badge/Badge';
import AccessTime from '@mui/icons-material/AccessTime';
import Check from '@mui/icons-material/Check';
import CircleOutlined from '@mui/icons-material/CircleOutlined';
import Close from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import PauseCircle from '@mui/icons-material/PauseCircle';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';

interface IChangeRequestStatusBadgeProps {
    changeRequest: ChangeRequestType | undefined;
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
        return null;
    }
    const { state } = changeRequest;
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
        case 'Scheduled': {
            const { schedule } = changeRequest;
            const scheduledAt = new Date(schedule.scheduledAt).toLocaleString();

            const { color, icon, tooltipTitle } = (() => {
                switch (schedule.status) {
                    case 'failed':
                        return {
                            color: 'error' as const,
                            icon: <ErrorIcon fontSize={'small'} />,
                            tooltipTitle: `Failed on ${scheduledAt} because of ${
                                schedule.reason ?? schedule.failureReason
                            }`,
                        };
                    case 'suspended':
                        return {
                            color: 'disabled' as const,
                            icon: <PauseCircle fontSize={'small'} />,
                            tooltipTitle: `Suspended  because: ${schedule.reason}`,
                        };
                    default:
                        return {
                            color: 'warning' as const,
                            icon: <AccessTime fontSize={'small'} />,
                            tooltipTitle: `Scheduled for ${scheduledAt}`,
                        };
                }
            })();

            return (
                <HtmlTooltip title={tooltipTitle} arrow>
                    <Badge color={color} icon={icon}>
                        Scheduled
                    </Badge>
                </HtmlTooltip>
            );
        }
        default:
            return <ReviewRequiredBadge />;
    }
};
