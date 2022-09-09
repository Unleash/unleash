import { VFC } from 'react';
import { Box, Button, Typography } from '@mui/material';
import UserInviteLink from '../ConfirmUserAdded/ConfirmUserLink/UserInviteLink/UserInviteLink';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IInviteLinkBarProps {}

export const InviteLinkBar: VFC<IInviteLinkBarProps> = () => {
    const inviteLink =
        'http://localhost:4242/new-user?invite=$2a$10$Xc0iYrClzE9y2QboSPSXme3UUlGfECYvTc0rwSuKXjkLLmlFtGfRu';

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
                                You have an invite link created on 24/07/2021
                                that will expire{' '}
                                <Typography
                                    component="span"
                                    variant="body2"
                                    color="error"
                                    fontWeight="bold"
                                >
                                    in 14 days
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
                <Button variant="outlined">
                    {inviteLink ? 'Update' : 'Create'} invite link
                </Button>
            </Box>
        </Box>
    );
};
