import { ProjectHealth } from './ProjectHealth.tsx';
import { styled } from '@mui/material';
import { ProjectResources } from './ProjectResources.tsx';

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
        "health resources"
    `,
    gridTemplateColumns: 'repeat(2, minmax(300px, 1fr))',
    gap: theme.spacing(1, 2),
    ...onNarrowGrid({
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
    }),
}));

const Tile = styled('div', {
    shouldForwardProp: (prop) => prop !== 'gridArea',
})<{ gridArea: string }>(({ theme, gridArea }) => ({
    gridArea,
    '&>*': {
        height: '100%',
    },
}));

export const ProjectHealthGrid = () => {
    return (
        <HealthContainer>
            <HealthGrid>
                <Tile gridArea='health'>
                    <ProjectHealth />
                </Tile>
                <Tile gridArea='resources'>
                    <ProjectResources />
                </Tile>
            </HealthGrid>
        </HealthContainer>
    );
};
