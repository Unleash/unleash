import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface IPasswordMatcherProps {
    started: boolean;
    passwordsDoNotMatch: boolean;
    sameAsOldPassword?: boolean;
}

const StyledMatcher = styled('div', {
    shouldForwardProp: (prop) => prop !== 'error',
})<{ error: boolean }>(({ theme, error }) => ({
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    color: error ? theme.palette.error.main : theme.palette.primary.main,
}));

const StyledMatcherCheckIcon = styled(CheckIcon)({
    marginRight: '5px',
});

const StyledMatcherErrorIcon = styled(CloseIcon)({
    marginRight: '5px',
});

const PasswordMatcher = ({
    started,
    passwordsDoNotMatch,
    sameAsOldPassword = false,
}: IPasswordMatcherProps) => {
    const error = passwordsDoNotMatch || sameAsOldPassword;

    if (!started) return null;

    const label = passwordsDoNotMatch
        ? 'Passwords do not match'
        : sameAsOldPassword
          ? 'Cannot be the same as the old password'
          : 'Passwords match';

    return (
        <StyledMatcher data-loading error={error}>
            <ConditionallyRender
                condition={error}
                show={<StyledMatcherErrorIcon />}
                elseShow={<StyledMatcherCheckIcon />}
            />{' '}
            <span>{label}</span>
        </StyledMatcher>
    );
};

export default PasswordMatcher;
