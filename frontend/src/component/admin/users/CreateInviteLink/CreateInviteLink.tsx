import { useState, VFC } from 'react';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import Input from 'component/common/Input/Input';
import { Box, Button, styled, Typography } from '@mui/material';
import { add } from 'date-fns';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { useNavigate } from 'react-router-dom';
import { GO_BACK } from 'constants/navigate';

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

export const CreateInviteLink: VFC<ICreateInviteLinkProps> = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [expiry, setExpiry] = useState(expiryOptions[0].key);
    const formatApiCode = () => `curl`; // TODO: code

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
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

    return (
        <FormTemplate
            // loading={loading}
            title="Create new invite link to Unleash"
            description="When you send an invite link to a someone, they will be able to create an account and get access to Unleash. This new user will only have read access, until you change their assigned role."
            documentationLink="https://docs.getunleash.io/user_guide/rbac#standard-roles" // FIXME: update
            documentationLinkLabel="User management documentation"
            formatApiCode={formatApiCode}
        >
            <Box
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
                            How to identify this invitation? (optional)
                        </Typography>
                        <StyledInput
                            label="Link name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            // error={Boolean(errors.name)}
                            // errorText={errors.name}
                            // onFocus={() => clearErrors()}
                            // classes={{ root: 'input' }}
                            autoFocus
                        />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ mb: 1 }}>
                            For how long it should stay active?
                        </Typography>
                        <GeneralSelect
                            label="Expires after"
                            name="type"
                            options={expiryOptions}
                            value={expiry}
                            onChange={setExpiry}
                            fullWidth
                            // className={styles.input}
                        />
                    </Box>
                    {/* <ConfirmUserAdded
                        open={showConfirm}
                        closeConfirm={closeConfirm}
                        emailSent={sendEmail}
                        inviteLink={inviteLink}
                    /> */}
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
                        // className={styles.cancelButton}
                    >
                        Cancel
                    </Button>
                </Box>
            </Box>
        </FormTemplate>
    );
};
