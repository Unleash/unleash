import { TokenType } from 'interfaces/token';
import { Link } from 'react-router-dom';
import { Alert } from '@mui/material';

export const CorsTokenAlert = () => {
    return (
        <Alert sx={{ mt: 4 }} severity="info">
            By default, all {TokenType.FRONTEND} tokens may be used from any
            CORS origin. If you'd like to configure a strict set of origins,
            please use the{' '}
            <Link to="/admin/cors" target="_blank">
                CORS origins configuration page
            </Link>
            .
        </Alert>
    );
};
