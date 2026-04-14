import type { FC } from 'react';
import { Box, Link, Typography } from '@mui/material';

type SuccessViewProps = {
    metricName: string;
};

export const SuccessView: FC<SuccessViewProps> = ({ metricName }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}
        >
            <Box>
                <Typography variant='h2' sx={{ mb: 1 }}>
                    Metric registered
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                    Your impact metric{' '}
                    <Typography
                        component='span'
                        variant='body2'
                        fontWeight='bold'
                    >
                        {metricName}
                    </Typography>{' '}
                    has been created. Your impact metrics will be available in a
                    few seconds.
                </Typography>
            </Box>

            <Box>
                <Typography variant='body2' fontWeight='bold' sx={{ mb: 1 }}>
                    Implement in your code
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                    To start collecting data, you need to implement the metric
                    in your application code using one of our SDKs.{' '}
                    <Link
                        href='https://docs.getunleash.io/reference/impact-metrics'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        View the documentation
                    </Link>{' '}
                    for setup instructions.
                </Typography>
            </Box>
        </Box>
    );
};
