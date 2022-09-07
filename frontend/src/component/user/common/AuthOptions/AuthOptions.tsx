import { Button } from '@mui/material';
import classnames from 'classnames';
import { useThemeStyles } from 'themes/themeStyles';
import { ReactComponent as GoogleSvg } from 'assets/icons/google.svg';
import LockRounded from '@mui/icons-material/LockRounded';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IAuthOptions } from 'hooks/api/getters/useAuth/useAuthEndpoint';
import { SSO_LOGIN_BUTTON } from 'utils/testIds';

interface IAuthOptionProps {
    options?: IAuthOptions[];
}

const AuthOptions = ({ options }: IAuthOptionProps) => {
    const { classes: themeStyles } = useThemeStyles();
    return (
        <>
            {options?.map(o => (
                <div
                    key={o.type}
                    className={classnames(
                        themeStyles.flexColumn,
                        themeStyles.contentSpacingY
                    )}
                >
                    <Button
                        color="primary"
                        data-loading
                        variant="outlined"
                        href={o.path}
                        size="small"
                        data-testid={`${SSO_LOGIN_BUTTON}-${o.type}`}
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
