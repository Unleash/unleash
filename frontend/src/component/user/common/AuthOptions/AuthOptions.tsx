import { Button } from '@material-ui/core';
import classnames from 'classnames';
import { useCommonStyles } from 'themes/commonStyles';
import { ReactComponent as GoogleSvg } from 'assets/icons/google.svg';
import LockRounded from '@material-ui/icons/LockRounded';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { IAuthOptions } from 'hooks/api/getters/useAuth/useAuthEndpoint';
import { SSO_LOGIN_BUTTON } from 'utils/testIds';

interface IAuthOptionProps {
    options?: IAuthOptions[];
}

const AuthOptions = ({ options }: IAuthOptionProps) => {
    const commonStyles = useCommonStyles();
    return (
        <>
            {options?.map(o => (
                <div
                    key={o.type}
                    className={classnames(
                        commonStyles.flexColumn,
                        commonStyles.contentSpacingY
                    )}
                >
                    <Button
                        color="primary"
                        data-loading
                        variant="outlined"
                        href={o.path}
                        size="small"
                        data-test={`${SSO_LOGIN_BUTTON}-${o.type}`}
                        style={{ height: '40px', color: '#000' }}
                        startIcon={
                            <ConditionallyRender
                                condition={o.type === 'google'}
                                show={
                                    <GoogleSvg
                                        style={{
                                            height: '35px',
                                            width: '35px',
                                        }}
                                    />
                                }
                                elseShow={
                                    <LockRounded
                                        style={{
                                            height: '25px',
                                            width: '25px',
                                        }}
                                    />
                                }
                            />
                        }
                    >
                        {o.message}
                    </Button>
                </div>
            ))}
        </>
    );
};

export default AuthOptions;
