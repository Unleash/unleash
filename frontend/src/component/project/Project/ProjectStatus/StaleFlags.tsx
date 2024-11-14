import { Typography } from '@mui/material';
import { styled } from '@mui/material';
import { PrettifyLargeNumber } from 'component/common/PrettifyLargeNumber/PrettifyLargeNumber';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { HealthGridTile } from './ProjectHealthGrid.styles';

const Wrapper = styled(HealthGridTile)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const BigText = styled('span')(({ theme }) => ({
    fontSize: `calc(2 * ${theme.typography.body1.fontSize})`,
    lineHeight: 0,
}));

const BigNumber: FC<{ value?: number }> = ({ value }) => {
    return (
        <BigText>
            <PrettifyLargeNumber
                value={value ?? 0}
                threshold={1000}
                precision={1}
            />
        </BigText>
    );
};

export const StaleFlags = () => {
    const projectId = useRequiredPathParam('projectId');
    return (
        <Wrapper>
            <Typography component='h4'>
                <BigNumber value={6} />{' '}
                <Link to={`/projects/${projectId}?state=IS%3Astale`}>
                    stale flags
                </Link>
            </Typography>
            <Typography variant='body2'>
                Remember to archive your stale feature flags to keep the project
                healthy
            </Typography>
        </Wrapper>
    );
};
