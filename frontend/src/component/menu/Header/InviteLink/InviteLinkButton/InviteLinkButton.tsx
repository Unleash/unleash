import { useContext, useState } from 'react';
import { ClickAwayListener, IconButton, styled, Tooltip } from '@mui/material';
import { useId } from 'hooks/useId';
import { focusable } from 'themes/themeStyles';
import AccessContext from 'contexts/AccessContext';
import PersonAdd from '@mui/icons-material/PersonAdd';
import { InviteLinkContent } from '../InviteLinkContent.tsx';

const StyledContainer = styled('div')(() => ({
    position: 'relative',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    ...focusable(theme),
    borderRadius: 100,
    '&:focus-visible': {
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineColor: theme.palette.primary.main,
        borderRadius: '100%',
    },
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
                    <StyledIconButton
                        onClick={() => setShowInviteLinkContent(true)}
                        size='large'
                    >
                        <PersonAdd />
                    </StyledIconButton>
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
