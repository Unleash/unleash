import type { ReactNode } from 'react';
import { Typography } from '@mui/material';

export const SchemaFieldDescription = ({
    description,
    id,
}: {
    description?: ReactNode;
    id?: string;
}) =>
    description ? (
        <Typography id={id} variant='body2' sx={{ color: 'text.secondary' }}>
            {description}
        </Typography>
    ) : null;
