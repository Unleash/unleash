import { type FC, useMemo } from 'react';
import type { FeatureSearchResponseSchema } from 'openapi';
import { styled } from '@mui/material';
import { getStatus } from './getStatus';

const Container = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
}));

export const StatusCell: FC<FeatureSearchResponseSchema> = ({
    lifecycle,
    environments,
}) => {
    const status = useMemo(
        () => getStatus({ lifecycle, environments }),
        [lifecycle, environments],
    );

    return <Container>{status}</Container>;
};
