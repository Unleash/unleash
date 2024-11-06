import { styled } from '@mui/material';

const LifecycleBox = styled('article')(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusExtraLarge,
    border: `2px solid ${theme.palette.divider}`,
    minWidth: '200px',
    aspectRatio: '1/1',
}));

const Wrapper = styled('article')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: theme.spacing(2),
}));

export const ProjectLifecycleSummary = () => {
    return (
        <Wrapper>
            <LifecycleBox />
            <LifecycleBox />
            <LifecycleBox />
            <LifecycleBox />
            <LifecycleBox />
        </Wrapper>
    );
};
