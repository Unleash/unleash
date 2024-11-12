import { styled } from '@mui/material';
import { FeatureLifecycleStageIcon } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/FeatureLifecycleStageIcon';
import useLoading from 'hooks/useLoading';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

const LifecycleBoxWrapper = styled('li')(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusExtraLarge,
    border: `2px solid ${theme.palette.divider}`,
    width: '180px',
    height: '175px',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-between',
}));

const Wrapper = styled('ul')(({ theme }) => ({
    display: 'grid',
    listStyle: 'none',
    gridTemplateColumns: 'repeat(auto-fit, 180px)',
    gap: theme.spacing(1),
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

const NoData = styled('span')({
    fontWeight: 'normal',
});

const LinkNoUnderline = styled(Link)({
    textDecoration: 'none',
});

const FormatAverageDays: FC<{ averageDays: number | null } | undefined> = (
    props,
) => {
    const Content = () => {
        if (!props) {
            return 'loading data';
        }
        const { averageDays } = props;
        if (averageDays === null) {
            return <NoData>No data</NoData>;
        }

        return `${averageDays} days`;
    };
    return (
        <dd data-loading-project-lifecycle-summary>
            <Content />
        </dd>
    );
};

export const ProjectLifecycleSummary = () => {
    const projectId = useRequiredPathParam('projectId');
    // const { data, loading } = useProjectStatus(projectId);
    const data = undefined;
    const loading = true;

    const loadingRef = useLoading<HTMLUListElement>(
        loading,
        '[data-loading-project-lifecycle-summary=true]',
    );
    return (
        <Wrapper ref={loadingRef}>
            <LifecycleBoxWrapper>
                <p>
                    <Counter>
                        <BigNumber data-loading-project-lifecycle-summary>
                            {data?.lifecycleSummary.initial.currentFlags ?? 15}
                        </BigNumber>

                        <FeatureLifecycleStageIcon
                            aria-hidden='true'
                            stage={{
                                name: 'initial',
                            }}
                        />
                    </Counter>
                    <span>flags in initial</span>
                </p>
                <Stats>
                    <dt>Avg. time in stage</dt>
                    <FormatAverageDays
                        averageDays={data?.lifecycleSummary.initial.averageDays}
                    />
                </Stats>
            </LifecycleBoxWrapper>
            <LifecycleBoxWrapper>
                <p>
                    <Counter>
                        <BigNumber data-loading-project-lifecycle-summary>
                            3
                        </BigNumber>

                        <FeatureLifecycleStageIcon
                            aria-hidden='true'
                            stage={{
                                name: 'pre-live',
                            }}
                        />
                    </Counter>
                    <span>flags in pre-live</span>
                </p>
                <Stats>
                    <dt>Avg. time in stage</dt>
                    <FormatAverageDays
                        averageDays={data?.lifecycleSummary.preLive.averageDays}
                    />
                </Stats>
            </LifecycleBoxWrapper>
            <LifecycleBoxWrapper>
                <p>
                    <Counter>
                        <BigNumber data-loading-project-lifecycle-summary>
                            2
                        </BigNumber>

                        <FeatureLifecycleStageIcon
                            aria-hidden='true'
                            stage={{
                                name: 'live',
                            }}
                        />
                    </Counter>
                    <span>flags in live</span>
                </p>
                <Stats>
                    <dt>Avg. time in stage</dt>

                    <FormatAverageDays
                        averageDays={data?.lifecycleSummary.live.averageDays}
                    />
                </Stats>
            </LifecycleBoxWrapper>
            <LifecycleBoxWrapper>
                <p>
                    <Counter>
                        <BigNumber data-loading-project-lifecycle-summary>
                            6
                        </BigNumber>

                        <FeatureLifecycleStageIcon
                            aria-hidden='true'
                            stage={{
                                name: 'completed',
                            }}
                        />
                    </Counter>
                    <span>
                        <LinkNoUnderline
                            to={`/projects/${projectId}/placeholder`}
                        >
                            flags
                        </LinkNoUnderline>{' '}
                        in cleanup
                    </span>
                </p>
                <Stats>
                    <dt>Avg. time in stage</dt>
                    <FormatAverageDays
                        averageDays={
                            data?.lifecycleSummary.completed.averageDays
                        }
                    />
                </Stats>
            </LifecycleBoxWrapper>
            <LifecycleBoxWrapper>
                <p>
                    <Counter>
                        <BigNumber data-loading-project-lifecycle-summary>
                            15
                        </BigNumber>

                        <FeatureLifecycleStageIcon
                            aria-hidden='true'
                            stage={{
                                name: 'archived',
                            }}
                        />
                    </Counter>
                    <span>flags in archived</span>
                </p>
                <Stats>
                    <dt>This month</dt>
                    <dd data-loading-project-lifecycle-summary>
                        3 flags archived
                    </dd>
                </Stats>
            </LifecycleBoxWrapper>
        </Wrapper>
    );
};
