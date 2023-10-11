import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Button, Paper, Typography, styled, Link } from '@mui/material';
import { basePath } from 'utils/formatPath';
import { IUser } from 'interfaces/user';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { InviteLinkBar } from '../../../admin/users/InviteLinkBar/InviteLinkBar';
import { InviteLinkBarContent } from '../../../admin/users/InviteLinkBar/InviteLinkBarContent';

const StyledPaper = styled(Paper)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusMedium,
    boxShadow: theme.boxShadows.popup,
    position: 'absolute',
    zIndex: 5000,
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
}: IInviteLinkContentProps) => (
    <ConditionallyRender
        condition={showInviteLinkContent}
        show={
            <StyledPaper className='dropdown-outline' id={id}>
                <InviteLinkBarContent
                    onActionClick={() => {
                        setShowInviteLinkContent(false);
                    }}
                />
            </StyledPaper>
        }
    />
);
