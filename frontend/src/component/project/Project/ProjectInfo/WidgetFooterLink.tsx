import { Link as RouterLink } from 'react-router-dom';
import { Link, Typography } from '@mui/material';
import { FC } from 'react';

interface IWidgetFooterLinkProps {
    to: string;
}

export const WidgetFooterLink: FC<IWidgetFooterLinkProps> = ({
    children,
    to,
}) => {
    return (
        <Typography
            variant="body2"
            textAlign="center"
            sx={{ marginTop: theme => theme.spacing(2.5) }}
        >
            <Link component={RouterLink} to={to}>
                {children}
            </Link>
        </Typography>
    );
};
