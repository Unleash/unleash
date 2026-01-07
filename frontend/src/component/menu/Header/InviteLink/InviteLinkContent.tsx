import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Paper, styled } from '@mui/material';
import { InviteLinkBarContent } from 'component/admin/users/InviteLinkBar/InviteLinkBarContent';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledPaper = styled(Paper)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusMedium,
    boxShadow: theme.boxShadows.popup,
    position: 'absolute',
    zIndex: theme.zIndex.snackbar,
    right: -255,
    minWidth: theme.spacing(80),
    [theme.breakpoints.down('md')]: {
        width: '100%',
        padding: '1rem',
    },
}));

interface IInviteLinkContentProps {
    id: string;
    showInviteLinkContent: boolean;
    setShowInviteLinkContent: (showInviteLinkContent: boolean) => void;
}

export const InviteLinkContent = ({
    id,
    showInviteLinkContent,
    setShowInviteLinkContent,
}: IInviteLinkContentProps) => {
    const { trackEvent } = usePlausibleTracker();

    const onInviteLinkActionClick = (inviteLink?: string) => {
        setShowInviteLinkContent(false);
        trackEvent('invite', {
            props: {
                eventType: inviteLink
                    ? 'header link bar action: edit'
                    : 'header link bar action: create',
            },
        });
    };
    return (
        <ConditionallyRender
            condition={showInviteLinkContent}
            show={
                <StyledPaper className='dropdown-outline' id={id}>
                    <InviteLinkBarContent
                        onActionClick={onInviteLinkActionClick}
                    />
                </StyledPaper>
            }
        />
    );
};
