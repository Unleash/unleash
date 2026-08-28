import { useContext, useState } from 'react';
import { ClickAwayListener, IconButton, styled, Tooltip } from '@mui/material';
import { useId } from 'hooks/useId';
import AccessContext from 'contexts/AccessContext';
import PersonAdd from '@mui/icons-material/PersonAdd';
import { InviteLinkContent } from '../InviteLinkContent.tsx';

const StyledContainer = styled('div')(() => ({
    position: 'relative',
}));

const InviteLinkButton = () => {
    const [showInviteLinkContent, setShowInviteLinkContent] = useState(false);
    const modalId = useId();

    const { isAdmin } = useContext(AccessContext);

    if (!isAdmin) {
        return null;
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
