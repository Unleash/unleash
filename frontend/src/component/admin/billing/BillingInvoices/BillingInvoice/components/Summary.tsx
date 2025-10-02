import { Box, Typography } from '@mui/material';
import { formatCurrency } from '../types.ts';

interface SummaryProps {
    subtotal: number;
    total: number;
}

export const Summary = ({ subtotal, total }: SummaryProps) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            mt: 2,
            alignItems: 'flex-end',
        }}
    >
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: { xs: '100%', sm: '60%', md: '40%' },
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                pb: 1,
            }}
        >
            <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                Sub total
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {formatCurrency(subtotal)}
            </Typography>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '60%', md: '40%' } }}>
            <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                Customer tax is exempt
            </Typography>
        </Box>
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: { xs: '100%', sm: '60%', md: '40%' },
                pt: 1,
            }}
        >
            <Typography variant='caption' sx={{ fontWeight: 600 }}>
                Total
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 700 }}>
                {formatCurrency(total)}
            </Typography>
        </Box>
    </Box>
);
