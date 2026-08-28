import { Alert, styled, Typography } from '@mui/material';
import { Link } from 'react-router';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { UserToken } from './UserToken/UserToken.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TokenType } from 'interfaces/token';

interface IConfirmUserLink {
    open: boolean;
    setOpen: (status: boolean) => void;
    closeConfirm: () => void;
    token: string;
    type?: string;
    secure: boolean;
}

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

export const ConfirmToken = ({
    open,
    setOpen,
    closeConfirm,
    token,
    type,
    secure,
}: IConfirmUserLink) => {
    return (
        <Dialogue
            open={open}
            setOpen={setOpen}
            onClick={closeConfirm}
            primaryButtonText='Close'
            title='New token created'
        >
            <Typography variant='body1'>
                Your new token has been created successfully.
            </Typography>
            <UserToken token={token} />
            <ConditionallyRender
                condition={secure}
                show={
                    <StyledAlert severity='info'>
                        Make sure to copy your API token now. You won't be able
                        to see it again!
                    </StyledAlert>
                }
            />
            <ConditionallyRender
                condition={type === TokenType.FRONTEND}
                show={
                    <Alert sx={{ mt: 2 }} severity='info'>
                        By default, all {TokenType.FRONTEND} tokens may be used
                        from any CORS origin. If you'd like to configure a
                        strict set of origins, please use the{' '}
                        <Link to='/admin/cors' target='_blank' rel='noreferrer'>
                            CORS origins configuration page
                        </Link>
                        .
                    </Alert>
                }
            />
        </Dialogue>
    );
};
