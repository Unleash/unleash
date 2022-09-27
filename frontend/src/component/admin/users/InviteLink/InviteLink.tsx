import { FormEventHandler, useState, VFC } from 'react';
import { useNavigate } from 'react-router-dom';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { Box, Button, styled, Typography } from '@mui/material';
import { add, parseISO } from 'date-fns';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { GO_BACK } from 'constants/navigate';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useInviteTokenApi } from 'hooks/api/actions/useInviteTokenApi/useInviteTokenApi';
import { useInviteTokens } from 'hooks/api/getters/useInviteTokens/useInviteTokens';
import { LinkField } from '../LinkField/LinkField';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

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

export const InviteLink: VFC<ICreateInviteLinkProps> = () => {
    const navigate = useNavigate();
    const { data, loading } = useInviteTokens();
    const [inviteLink, setInviteLink] = useState('');
    const [expiry, setExpiry] = useState(expiryOptions[0].key);
    const { uiConfig } = useUiConfig();
    const defaultToken = data?.tokens?.find(token => token.name === 'default');
    const isUpdating = Boolean(defaultToken);
    const formatApiCode = () =>
        isUpdating
            ? `curl --location --request PUT '${
                  uiConfig.unleashUrl
              }/api/admin/invite-link/tokens/default' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify({ expiresAt: expiry }, undefined, 2)}'`
            : `curl --location --request POST '${
                  uiConfig.unleashUrl
              }/api/admin/invite-link/tokens' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(
                  { name: 'default', expiresAt: expiry },
                  undefined,
                  2
              )}'`;

    const [isSending, setIsSending] = useState(false);
    const { setToastApiError } = useToast();
    const { createToken, updateToken } = useInviteTokenApi();

    const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
        e.preventDefault();
        setIsSending(true);

        try {
            if (isUpdating) {
                await updateToken(defaultToken!.secret, {
                    expiresAt: parseISO(expiry),
                });
                setInviteLink(defaultToken!.url);
            } else {
                const response = await createToken({
                    name: 'default',
                    expiresAt: parseISO(expiry),
                });
                const newToken = await response.json();
                setInviteLink(newToken.url);
            }
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setIsSending(false);
        }
    };

    const onDisableClick = async () => {
        // FIXME: confirm dialog
        setIsSending(true);
        try {
            await updateToken(defaultToken!.secret, {
                enabled: false,
            });
            navigate(GO_BACK);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setIsSending(false);
        }
    };

    const closeConfirm = () => {
        setInviteLink('');
        navigate('/admin/users');
    };

    return (
        <FormTemplate
            loading={loading || isSending}
            title={isUpdating ? 'Update invite link' : 'Create invite link'}
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
                    <PermissionButton
                        type="submit"
                        permission={ADMIN}
                        disabled={isSending}
                    >
                        {isUpdating
                            ? 'Update invite link'
                            : 'Create invite link'}
                    </PermissionButton>
                    <ConditionallyRender
                        condition={isUpdating}
                        show={
                            <Button
                                sx={{ ml: 2 }}
                                onClick={onDisableClick}
                                color="error"
                            >
                                Delete link
                            </Button>
                        }
                    />
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
                    <LinkField
                        inviteLink={inviteLink}
                    />

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
