import { useEffect, useState, VFC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import UserInviteLink from '../ConfirmUserAdded/ConfirmUserLink/UserInviteLink/UserInviteLink';

interface IInviteLinkBarProps {}

export const InviteLinkBar: VFC<IInviteLinkBarProps> = () => {
    const navigate = useNavigate();
    const [inviteLink, setInviteLink] = useState('');

    useEffect(() => {
        const link = window.localStorage.getItem('inviteLink');
        if (link) {
            setInviteLink(link);
        }
    }, []);

    return (
        <Box
            sx={{
                backgroundColor: 'tertiary.background',
                py: 2,
                px: 4,
                mb: 2,
                borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                border: '2px solid',
                borderColor: 'primary.main',
            }}
        >
            <Box
                sx={{
                    mb: { xs: 1, md: 0 },
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}
            >
                <ConditionallyRender
                    condition={Boolean(inviteLink)}
                    show={
                        <>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                You have an invite link created on 09/09/2021
                                that will expire{' '}
                                <Typography
                                    component="span"
                                    variant="body2"
                                    // color="error"
                                    fontWeight="bold"
                                >
                                    in 7 days
                                </Typography>
                            </Typography>
                            <UserInviteLink small inviteLink={inviteLink} />
                        </>
                    }
                    elseShow={
                        <Typography variant="body2">
                            You can easily create an invite link here that you
                            can share and use to invite people from your company
                            to your Unleash setup.
                        </Typography>
                    }
                />
            </Box>
            <Box
                sx={{
                    minWidth: 200,
                    display: 'flex',
                    justifyContent: { xs: 'center', md: 'flex-end' },
                    alignItems: 'center',
                    flexGrow: 1,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={() => navigate('/admin/invite-link')}
                >
                    {inviteLink ? 'Update' : 'Create'} invite link
                </Button>
            </Box>
        </Box>
    );
};
