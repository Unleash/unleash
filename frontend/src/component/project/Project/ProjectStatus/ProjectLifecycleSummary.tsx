import { styled } from '@mui/material';
import { FeatureLifecycleStageIcon } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/FeatureLifecycleStageIcon';

const LifecycleBox = styled('li')(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusExtraLarge,
    border: `2px solid ${theme.palette.divider}`,
    aspectRatio: '1/1',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-between',
}));

const Wrapper = styled('ul')(({ theme }) => ({
    display: 'grid',
    listStyle: 'none',
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
                                name: 'initial',
                                enteredStageAt: '',
                            }}
                        />
                    </Counter>
                    <span>flags in initial</span>
                </p>
                <Stats>
                    <dt>Avg. time in stage</dt>
                    <dd>21 days</dd>
                </Stats>
            </LifecycleBox>
            <LifecycleBox>
                <p>
                    <Counter>
                        <BigNumber>3</BigNumber>

                        <FeatureLifecycleStageIcon
                            stage={{
                                name: 'pre-live',
                                enteredStageAt: '',
                                environments: [],
                            }}
                        />
                    </Counter>
                    <span>flags in pre-live</span>
                </p>
                <Stats>
                    <dt>Avg. time in stage</dt>
                    <dd>18 days</dd>
                </Stats>
            </LifecycleBox>
            <LifecycleBox>
                <p>
                    <Counter>
                        <BigNumber>2</BigNumber>

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
            <LifecycleBox>
                <p>
                    <Counter>
                        <BigNumber>6</BigNumber>

                        <FeatureLifecycleStageIcon
                            stage={{
                                name: 'completed',
                                enteredStageAt: '',
                                environments: [],
                                status: 'kept',
                            }}
                        />
                    </Counter>
                    <span>flags in cleanup</span>
                </p>
                <Stats>
                    <dt>Avg. time in stage</dt>
                    <dd>No data</dd>
                </Stats>
            </LifecycleBox>
            <LifecycleBox>
                <p>
                    <Counter>
                        <BigNumber>15</BigNumber>

                        <FeatureLifecycleStageIcon
                            stage={{
                                name: 'archived',
                                enteredStageAt: '',
                            }}
                        />
                    </Counter>
                    <span>flags in archived</span>
                </p>
                <Stats>
                    <dt>This month</dt>
                    <dd>3 flags archived</dd>
                </Stats>
            </LifecycleBox>
        </Wrapper>
    );
};
