import { useContext, useState } from 'react';
import {
    Button,
    ClickAwayListener,
    IconButton,
    styled,
    Tooltip,
} from '@mui/material';
import { useId } from 'hooks/useId';
import AccessContext from 'contexts/AccessContext';
import PersonAdd from '@mui/icons-material/PersonAdd';
import { InviteLinkContent } from '../InviteLinkContent.tsx';
import { useUiFlag } from 'hooks/useUiFlag';
import { Link } from 'react-router';

const StyledContainer = styled('div')(() => ({
    position: 'relative',
}));

const InviteLinkButton = () => {
    const [showInviteLinkContent, setShowInviteLinkContent] = useState(false);
    const modalId = useId();

    const { isAdmin } = useContext(AccessContext);
    const newUserInviteFlow = useUiFlag('newUserInviteFlow');

    if (!isAdmin) {
        return null;
    }

    if (newUserInviteFlow) {
        return (
            <Button
                component={Link}
                to='/admin/users'
                variant='outlined'
                color='inherit'
                startIcon={<PersonAdd />}
                aria-label='Invite users'
                sx={(theme) => ({
                    mx: 1,
                    color: theme.palette.neutral.main,
                    borderColor: theme.palette.neutral.containerBorder,
                    '&:hover': {
                        color: theme.palette.neutral.dark,
                        borderColor: theme.palette.neutral.main,
                        backgroundColor: theme.palette.neutral.container,
                    },
                })}
            >
                Invite
            </Button>
        );
    }

    return (
        <ClickAwayListener onClickAway={() => setShowInviteLinkContent(false)}>
            <StyledContainer>
                <Tooltip title='Invite users' arrow>
                    <IconButton
                        onClick={() => setShowInviteLinkContent(true)}
                        size='large'
                    >
                        <PersonAdd />
                    </IconButton>
                </Tooltip>
                <InviteLinkContent
                    showInviteLinkContent={showInviteLinkContent}
                    setShowInviteLinkContent={setShowInviteLinkContent}
                    id={modalId}
                />
            </StyledContainer>
        </ClickAwayListener>
    );
};

export default InviteLinkButton;
