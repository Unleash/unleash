import { styled } from '@mui/material';
import { FeatureLifecycleStageIcon } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/FeatureLifecycleStageIcon';

const LifecycleBox = styled('article')(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusExtraLarge,
    border: `2px solid ${theme.palette.divider}`,
    aspectRatio: '1/1',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-between',
}));

const Wrapper = styled('article')(({ theme }) => ({
    display: 'grid',

    gridTemplateColumns: 'repeat(auto-fit, 200px)',
    gap: theme.spacing(2),
    justifyContent: 'center',
}));

const Counter = styled('span')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
});

const BigNumber = styled('span')(({ theme }) => ({
    fontSize: `calc(2 * ${theme.typography.body1.fontSize})`,
}));

const Stats = styled('dl')(({ theme }) => ({
    margin: 0,
    fontSize: theme.typography.body2.fontSize,
    '& dd': {
        margin: 0,
        fontWeight: 'bold',
    },
}));

export const ProjectLifecycleSummary = () => {
    return (
        <Wrapper>
            <LifecycleBox>
                <p>
                    <Counter>
                        <BigNumber>15</BigNumber>

                        <FeatureLifecycleStageIcon
                            stage={{
                                name: 'live',
                                enteredStageAt: '',
                                environments: [],
                            }}
                        />
                    </Counter>
                    <span>flags in live</span>
                </p>
                <Stats>
                    <dt>Avg. time in stage</dt>
                    <dd>10 days</dd>
                </Stats>
            </LifecycleBox>
            <LifecycleBox />
            <LifecycleBox />
            <LifecycleBox />
            <LifecycleBox />
        </Wrapper>
    );
};
