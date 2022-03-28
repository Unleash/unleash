import useLoading from 'hooks/useLoading';
import { TextField, Typography } from '@material-ui/core';
import StandaloneBanner from '../StandaloneBanner/StandaloneBanner';
import ResetPasswordDetails from '../common/ResetPasswordDetails/ResetPasswordDetails';
import { useStyles } from './NewUser.styles';
import useResetPassword from 'hooks/api/getters/useResetPassword/useResetPassword';
import StandaloneLayout from '../common/StandaloneLayout/StandaloneLayout';
import ConditionallyRender from 'component/common/ConditionallyRender';
import InvalidToken from '../common/InvalidToken/InvalidToken';
import AuthOptions from '../common/AuthOptions/AuthOptions';
import DividerText from 'component/common/DividerText/DividerText';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';

export const NewUser = () => {
    const { authDetails } = useAuthDetails();
    const { token, data, loading, setLoading, invalidToken } =
        useResetPassword();
    const ref = useLoading(loading);
    const styles = useStyles();

    return (
        <div ref={ref}>
            <StandaloneLayout
                showMenu={false}
                BannerComponent={<StandaloneBanner title={'Unleash'} />}
            >
                <div className={styles.newUser}>
                    <ConditionallyRender
                        condition={invalidToken}
                        show={<InvalidToken />}
                        elseShow={
                            <ResetPasswordDetails
                                token={token}
                                setLoading={setLoading}
                            >
                                <h2 className={styles.title}>
                                    Enter your personal details and start your
                                    journey
                                </h2>
                                <ConditionallyRender
                                    condition={data?.createdBy}
                                    show={
                                        <Typography
                                            variant="body1"
                                            data-loading
                                            className={styles.inviteText}
                                        >
                                            {data?.createdBy}
                                            <br></br> has invited you to join
                                            Unleash.
                                        </Typography>
                                    }
                                />

                                <Typography
                                    data-loading
                                    variant="body1"
                                    className={styles.subtitle}
                                >
                                    Your username is
                                </Typography>

                                <TextField
                                    data-loading
                                    value={data?.email || ''}
                                    variant="outlined"
                                    size="small"
                                    className={styles.emailField}
                                    disabled
                                />
                                <div className={styles.roleContainer}>
                                    <ConditionallyRender
                                        condition={Boolean(
                                            authDetails?.options?.length
                                        )}
                                        show={
                                            <>
                                                <DividerText
                                                    text="sign in with"
                                                    data-loading
                                                />

                                                <AuthOptions
                                                    options={
                                                        authDetails?.options
                                                    }
                                                />
                                                <DividerText
                                                    text="or set a new password for your account"
                                                    data-loading
                                                />
                                            </>
                                        }
                                        elseShow={
                                            <Typography
                                                variant="body1"
                                                data-loading
                                            >
                                                Set a password for your account.
                                            </Typography>
                                        }
                                    />
                                </div>
                            </ResetPasswordDetails>
                        }
                    />
                </div>
            </StandaloneLayout>
        </div>
    );
};
