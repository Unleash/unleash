import { Box, styled, Switch, Typography } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import useInstanceStatusApi from 'hooks/api/actions/useInstanceStatusApi/useInstanceStatusApi';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import useToast from 'hooks/useToast';
import { useEffect, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';

const StyledElement = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1, 2),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    border: '2px solid',
    borderColor: theme.palette.divider,
    flex: 'auto',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
}));

const StyledContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const StyledBody = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

export const UsersHeaderAutoCreateDomainUsers = () => {
    const { setToastData, setToastApiError } = useToast();
    const { instanceStatus, refetchInstanceStatus, loading } =
        useInstanceStatus();
    const { setAutoCreateDomainUsers } = useInstanceStatusApi();

    const [autoCreateDomainUsers, setAutoCreateDomainUsersState] = useState(
        Boolean(instanceStatus?.autoCreateDomainUsers),
    );

    useEffect(() => {
        if (instanceStatus) {
            setAutoCreateDomainUsersState(
                Boolean(instanceStatus.autoCreateDomainUsers),
            );
        }
    }, [instanceStatus, loading]);

    const onAutoCreateDomainUsersToggle = async () => {
        try {
            await setAutoCreateDomainUsers(!autoCreateDomainUsers);
            setAutoCreateDomainUsersState(!autoCreateDomainUsers);
            refetchInstanceStatus();
            setToastData({
                type: 'success',
                text: `Automatic email domain joining ${
                    !autoCreateDomainUsers ? 'enabled' : 'disabled'
                }`,
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    if (!instanceStatus?.ucaSignup) return null;

    return (
        <StyledElement>
            <StyledContainer>
                {instanceStatus.emailDomain ? (
                    <>
                        <StyledBody>
                            <Typography variant='body2'>
                                Allow people with{' '}
                                <strong>@{instanceStatus.emailDomain}</strong>{' '}
                                emails to join automatically
                            </Typography>
                            <HelpIcon
                                tooltip={
                                    <>
                                        People with this email domain will be
                                        able to join automatically when signing
                                        in via Unleash's website.
                                        <br />
                                        <br />
                                        Need help? Contact us at{' '}
                                        <a href='mailto:self-service@getunleash.io'>
                                            self-service@getunleash.io
                                        </a>
                                    </>
                                }
                            />
                        </StyledBody>
                        <Switch
                            checked={autoCreateDomainUsers}
                            onChange={onAutoCreateDomainUsersToggle}
                        />
                    </>
                ) : (
                    <Typography variant='body2'>
                        Want your colleagues to join you automatically? Contact
                        us at{' '}
                        <a href='mailto:self-service@getunleash.io'>
                            self-service@getunleash.io
                        </a>{' '}
                        and we'll help set it up.
                    </Typography>
                )}
            </StyledContainer>
        </StyledElement>
    );
};
