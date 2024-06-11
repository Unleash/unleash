import { Link as RouterLink } from 'react-router-dom';
import { Link, Typography } from '@mui/material';
import type React from 'react';
import type { FC } from 'react';

interface IWidgetFooterLinkProps {
    to: string;
    children?: React.ReactNode;
}

export const WidgetFooterLink: FC<IWidgetFooterLinkProps> = ({
    children,
    to,
}) => {
    return (
        <Typography
            data-loading
            variant='body2'
            textAlign='center'
            sx={{
                paddingTop: (theme) => theme.spacing(2.5),
                marginTop: 'auto',
                justifySelf: 'flex-end',
            }}
        >
            <Link component={RouterLink} to={to}>
                {children}
            </Link>
        </Typography>
    );
};
