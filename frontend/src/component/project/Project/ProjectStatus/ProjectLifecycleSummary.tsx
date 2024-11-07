import { Typography, styled } from '@mui/material';
import { FeatureLifecycleStageIcon } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/FeatureLifecycleStageIcon';

const LifecycleBox = styled('article')(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusExtraLarge,
    border: `2px solid ${theme.palette.divider}`,
    aspectRatio: '1/1',
    display: 'grid',

    gridTemplateAreas: `
        "count icon"
        "description description"
        "stats stats"
    `,

    gridTemplateColumns: '1fr auto',
}));

const GridCell = styled('span', {
    shouldForwardProp: (prop) => prop !== 'gridArea',
})<{ gridArea: string }>(({ gridArea }) => ({
    gridArea,
}));

const Wrapper = styled('article')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: theme.spacing(2),
}));

export const ProjectLifecycleSummary = () => {
    return (
        <Wrapper>
            <LifecycleBox>
                <GridCell gridArea='count'>
                    <Typography variant='h1' component='span'>
                        15
                    </Typography>
                </GridCell>
                <GridCell gridArea='icon'>
                    <FeatureLifecycleStageIcon
                        stage={{
                            name: 'live',
                            enteredStageAt: '',
                            environments: [],
                        }}
                    />
                </GridCell>
                <GridCell gridArea='description'>flags in live</GridCell>
                <GridCell gridArea='stats'>Avg. time in stage 10 days</GridCell>
            </LifecycleBox>
            <LifecycleBox />
            <LifecycleBox />
            <LifecycleBox />
            <LifecycleBox />
        </Wrapper>
    );
};
