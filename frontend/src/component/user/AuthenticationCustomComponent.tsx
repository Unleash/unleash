import { VFC } from 'react';
import { CardActions, Button } from '@mui/material';
import { IAuthEndpointDetailsResponse } from 'hooks/api/getters/useAuth/useAuthEndpoint';

interface IAuthenticationCustomComponentProps {
    authDetails: IAuthEndpointDetailsResponse;
}

export const AuthenticationCustomComponent: VFC<
    IAuthenticationCustomComponentProps
> = ({ authDetails }) => (
    <div>
        <p>{authDetails.message}</p>
        <CardActions style={{ textAlign: 'center' }}>
            <a href={authDetails.path} style={{ width: '100%' }}>
                <Button
                    variant="contained"
                    color="primary"
                    style={{ width: '150px', margin: '0 auto' }}
                >
                    Sign In
                </Button>
            </a>
        </CardActions>
    </div>
);
