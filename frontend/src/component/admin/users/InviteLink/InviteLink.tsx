import { FormEventHandler, useState, VFC } from 'react';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import Input from 'component/common/Input/Input';
import { Box, Button, styled, Typography } from '@mui/material';
import { add } from 'date-fns';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { useNavigate } from 'react-router-dom';
import { GO_BACK } from 'constants/navigate';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import UserInviteLink from '../ConfirmUserAdded/ConfirmUserLink/UserInviteLink/UserInviteLink';

interface ICreateInviteLinkProps {}

const expiryOptions = [
    {
        key: add(new Date(), { hours: 48 }).toISOString(),
        label: '48 hours',
    },
    {
        key: add(new Date(), { weeks: 1 }).toISOString(),
        label: '1 week',
    },
    {
        key: add(new Date(), { months: 1 }).toISOString(),
        label: '1 month',
    },
];

const StyledInput = styled(Input)(() => ({
    width: '100%',
}));

export const InviteLink: VFC<ICreateInviteLinkProps> = () => {
    const navigate = useNavigate();
    const [inviteLink, setInviteLink] = useState('');
    const [expiry, setExpiry] = useState(expiryOptions[0].key);
    const formatApiCode = () => `curl ??? TODO`; // TODO: code
    const [loading, setLoading] = useState(false);

    const handleSubmit: FormEventHandler<HTMLFormElement> = e => {
        e.preventDefault();
        setLoading(true);
        // FIXME: integrate backend
        setTimeout(() => {
            setInviteLink(
                'http://localhost:3000/new-user?invite=$2a$10$Xc0iYrClzE9y2QboSPSXme3UUlGfECYvTc0rwSuKXjkLLmlFtGfRu'
            );
            setLoading(false);
            window.localStorage.setItem(
                'inviteLink',
                'http://localhost:3000/new-user?invite=$2a$10$Xc0iYrClzE9y2QboSPSXme3UUlGfECYvTc0rwSuKXjkLLmlFtGfRu'
            );
        }, 3000);
        // clearErrors();
        // try {
        //     await addUser(payload)
        //         .then(res => res.json())
        //         .then(user => {
        //             setInviteLink(user.inviteLink);
        //             setShowConfirm(true);
        //         });
        // } catch (error: unknown) {
        //     setToastApiError(formatUnknownError(error));
        // }
    };

    const closeConfirm = () => {
        setInviteLink('');
        navigate('/admin/users');
    };

    return (
        <FormTemplate
            loading={loading}
            title="Create invite link"
            description="When you send an invite link to a someone, they will be able to create an account and get access to Unleash. This new user will only have read access, until you change their assigned role."
            documentationLink="https://docs.getunleash.io/user_guide/rbac#standard-roles" // FIXME: update
            documentationLinkLabel="User management documentation"
            formatApiCode={formatApiCode}
        >
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                }}
                data-testid="create-invite-link-form"
            >
                <Box sx={{ maxWidth: '400px' }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ mb: 1 }}>
                            Expiration period for the invite link
                        </Typography>
                        <GeneralSelect
                            label="Link will expire in"
                            name="type"
                            options={expiryOptions}
                            value={expiry}
                            onChange={setExpiry}
                            fullWidth
                        />
                    </Box>
                    <Typography sx={{ mb: 1 }}>
                        People using this link will be invited as:
                    </Typography>
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: theme =>
                                `${theme.shape.borderRadiusMedium}px`,
                            backgroundColor: theme =>
                                theme.palette.secondaryContainer,
                        }}
                    >
                        <Typography variant="body2" fontWeight="bold">
                            Viewer
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Users with this role can only read root resources in
                            Unleash. The viewer can be added to specific
                            projects as project member. Viewers may not view API
                            tokens.
                        </Typography>
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mt: 'auto',
                    }}
                >
                    <CreateButton name="invite link" permission={ADMIN} />
                    <Button
                        sx={{ ml: 2 }}
                        onClick={() => {
                            navigate(GO_BACK);
                        }}
                    >
                        Cancel
                    </Button>
                </Box>
            </Box>
            <Dialogue
                open={Boolean(inviteLink)}
                onClick={closeConfirm}
                primaryButtonText="Close"
                title="Invite link created"
            >
                <Box sx={{ pt: 2 }}>
                    <Typography variant="body1">
                        New team members now sign-up to Unleash. Please provide
                        them with the following link to get started:
                    </Typography>
                    <UserInviteLink inviteLink={inviteLink} />

                    <Typography variant="body1">
                        Copy the link and send it to the user. This will allow
                        them to set up their password and get started with their
                        Unleash account.
                    </Typography>
                </Box>
            </Dialogue>
        </FormTemplate>
    );
};
