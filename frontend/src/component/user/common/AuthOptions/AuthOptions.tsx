import { Button } from '@mui/material';
import classnames from 'classnames';
import { useThemeStyles } from 'themes/themeStyles';
import { ReactComponent as GoogleSvg } from 'assets/icons/google.svg';
import LockRounded from '@mui/icons-material/LockRounded';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IAuthOptions } from 'hooks/api/getters/useAuth/useAuthEndpoint';
import { SSO_LOGIN_BUTTON } from 'utils/testIds';
import useQueryParams from 'hooks/useQueryParams';

interface IAuthOptionProps {
    options?: IAuthOptions[];
}

function addOrOverwriteRedirect(path: string, redirectValue: string): string {
    const [basePath, queryString = ''] = path.split('?');
    const params = new URLSearchParams(queryString);
    params.set('redirect', redirectValue);
    return `${basePath}?${params.toString()}`;
}

const AuthOptions = ({ options }: IAuthOptionProps) => {
    const { classes: themeStyles } = useThemeStyles();
    const query = useQueryParams();
    const redirectPath = query.get('redirect') || '';

    return (
        <>
            {options?.map((o) => (
                <div
                    key={o.type}
                    className={classnames(
                        themeStyles.flexColumn,
                        themeStyles.contentSpacingY,
                    )}
                >
                    <Button
                        color='primary'
                        data-loading
                        variant='outlined'
                        href={
                            redirectPath
                                ? addOrOverwriteRedirect(o.path, redirectPath)
                                : o.path
                        }
                        size='small'
                        data-testid={`${SSO_LOGIN_BUTTON}-${o.type}`}
                        style={{
                            height: '40px',
                        }}
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
