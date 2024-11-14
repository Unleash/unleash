import { ProjectHealth } from './ProjectHealth';
import { styled } from '@mui/material';
import { StaleFlags } from './StaleFlags';
import { ProjectResources } from './ProjectResources';

const onNarrowGrid = (css: object) => ({
    '@container (max-width: 650px)': css,
    '@supports not (container-type: inline-size)': {
        '@media (max-width: 712px)': css,
    },
});

const HealthContainer = styled('div')({
    containerType: 'inline-size',
});

const HealthGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas: `
        "health resources"
        "stale resources"
    `,
    gridTemplateColumns: 'repeat(2, minmax(300px, 1fr))',
    gap: theme.spacing(1, 2),
    ...onNarrowGrid({
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
    }),
}));

export const ProjectHealthGrid = () => {
    return (
        <HealthContainer>
            <HealthGrid>
                <ProjectHealth />
                <StaleFlags />
                <ProjectResources />
            </HealthGrid>
        </HealthContainer>
    );
};
