import useLoading from '../../../hooks/useLoading';
import { TextField, Typography } from '@material-ui/core';

import StandaloneBanner from '../StandaloneBanner/StandaloneBanner';
import ResetPasswordDetails from '../common/ResetPasswordDetails/ResetPasswordDetails';

import { useStyles } from './NewUser.styles';
import { useCommonStyles } from '../../../common.styles';
import useResetPassword from '../../../hooks/useResetPassword';
import StandaloneLayout from '../common/StandaloneLayout/StandaloneLayout';
import ConditionallyRender from '../../common/ConditionallyRender';
import InvalidToken from '../common/InvalidToken/InvalidToken';
import { IAuthStatus } from '../../../interfaces/user';
import AuthOptions from '../common/AuthOptions/AuthOptions';

interface INewUserProps {
    user: IAuthStatus;
}

const NewUser = ({ user }: INewUserProps) => {
    const { token, data, loading, setLoading, invalidToken } =
        useResetPassword();
    const ref = useLoading(loading);
    const commonStyles = useCommonStyles();
    const styles = useStyles();

    return (
        <div ref={ref}>
            <StandaloneLayout
                showMenu={false}
                BannerComponent={
                    <StandaloneBanner showStars title={'Welcome to Unleash'}>
                        <ConditionallyRender
                            condition={data?.createdBy}
                            show={
                                <Typography variant="body1">
                                    You have been invited by {data?.createdBy}
                                </Typography>
                            }
                        />
                    </StandaloneBanner>
                }
            >
                <ConditionallyRender
                    condition={invalidToken}
                    show={<InvalidToken />}
                    elseShow={
                        <ResetPasswordDetails
                            token={token}
                            setLoading={setLoading}
                        >
                            <Typography
                                data-loading
                                variant="subtitle1"
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
                                <Typography
                                    data-loading
                                    variant="subtitle1"
                                    className={styles.subtitle}
                                >
                                    In Unleash your role is:{' '}
                                    <i>{data?.role?.name}</i>
                                </Typography>
                                <Typography variant="body1" data-loading>
                                    {data?.role?.description}
                                </Typography>
                                <div
                                    className={commonStyles.largeDivider}
                                    data-loading
                                />
                                <ConditionallyRender
                                    condition={
                                        user?.authDetails?.options?.length > 0
                                    }
                                    show={
                                        <>
                                            <Typography data-loading>
                                                Login with 3rd party providers
                                            </Typography>
                                            <AuthOptions
                                                options={
                                                    user?.authDetails?.options
                                                }
                                            />
                                            <div
                                                className={
                                                    commonStyles.largeDivider
                                                }
                                                data-loading
                                            />
                                            <Typography
                                                className={
                                                    styles.passwordHeader
                                                }
                                                data-loading
                                            >
                                                OR set a new password for your
                                                account
                                            </Typography>
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
            </StandaloneLayout>
        </div>
    );
};

export default NewUser;
