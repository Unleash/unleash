import { Button, styled } from '@mui/material';
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

const StyledSsoButton = styled(Button)(({ theme }) => ({
    height: '40px',
    color: theme.palette.text.primary,
    borderColor: theme.palette.divider,
    '&:hover': {
        borderColor: theme.palette.text.primary,
        backgroundColor: theme.palette.action.hover,
    },
}));

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

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
}));

const AuthOptions = ({ options }: IAuthOptionProps) => {
    const query = useQueryParams();
    const redirectPath = query.get('redirect') || '';

    return (
        <StyledContainer>
            {options?.map((o) => (
                <StyledSsoButton
                    key={o.type}
                    data-loading
                    variant='outlined'
                    href={
                        redirectPath
                            ? addOrOverwriteRedirect(o.path, redirectPath)
                            : o.path
                    }
                    size='small'
                    data-testid={`${SSO_LOGIN_BUTTON}-${o.type}`}
                    startIcon={renderStartIcon(o)}
                >
                    {o.message}
                </StyledSsoButton>
            ))}
        </StyledContainer>
    );
};

export default AuthOptions;
