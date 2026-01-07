import { Button } from '@mui/material';
import classnames from 'classnames';
import { useThemeStyles } from 'themes/themeStyles';
import LockRounded from '@mui/icons-material/LockRounded';
import type { IAuthOptions } from 'hooks/api/getters/useAuth/useAuthEndpoint';
import { SSO_LOGIN_BUTTON } from 'utils/testIds';
import useQueryParams from 'hooks/useQueryParams';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';

interface IAuthOptionProps {
    options?: IAuthOptions[];
}

function addOrOverwriteRedirect(path: string, redirectValue: string): string {
    const [basePath, queryString = ''] = path.split('?');
    const params = new URLSearchParams(queryString);
    params.set('redirect', redirectValue);
    return `${basePath}?${params.toString()}`;
}

const renderStartIcon = ({ type }: IAuthOptions) => {
    if (type === 'google') {
        return (
            <GoogleIcon
                style={{
                    height: '20px',
                    width: '20px',
                }}
            />
        );
    } else if (type === 'github') {
        return (
            <GitHubIcon
                style={{
                    height: '20px',
                    width: '20px',
                }}
            />
        );
    }

    return (
        <LockRounded
            style={{
                height: '20px',
                width: '20px',
            }}
        />
    );
};

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
                        startIcon={renderStartIcon(o)}
                    >
                        {o.message}
                    </Button>
                </div>
            ))}
        </>
    );
};

export default AuthOptions;
