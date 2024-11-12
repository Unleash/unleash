import { styled } from '@mui/material';
import { FeatureLifecycleStageIcon } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/FeatureLifecycleStageIcon';
import { useProjectStatus } from 'hooks/api/getters/useProjectStatus/useProjectStatus';
import useLoading from 'hooks/useLoading';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { FC } from 'react';
import { PrettifyLargeNumber } from 'component/common/PrettifyLargeNumber/PrettifyLargeNumber';
const LifecycleBox = styled('li')(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusExtraLarge,
    border: `2px solid ${theme.palette.divider}`,
    height: '175px',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-between',
}));

const Wrapper = styled('ul')(({ theme }) => ({
    display: 'grid',
    listStyle: 'none',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: theme.spacing(1),
    justifyContent: 'center',
}));

const Counter = styled('span')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
});

const BigText = styled('span')(({ theme }) => ({
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

const AverageDaysStat: FC<{ averageDays?: number | null }> = ({
    averageDays,
}) => {
    const Content = () => {
        if (averageDays === null || averageDays === undefined) {
            return <NoData>No data</NoData>;
        }

        if (averageDays < 1) {
            return 'less than a day';
        }
        return `${averageDays} days`;
    };
    return (
        <Stats>
            <dt>Avg. time in stage</dt>
            <dd data-loading-project-lifecycle-summary>
                <Content />
            </dd>
        </Stats>
    );
};

const BigNumber: FC<{ value?: number }> = ({ value }) => {
    return (
        <BigText data-loading-project-lifecycle-summary>
            <PrettifyLargeNumber
                value={value ?? 0}
                threshold={1000}
                precision={1}
            />
        </BigText>
    );
};

export const ProjectLifecycleSummary = () => {
    const projectId = useRequiredPathParam('projectId');
    const { data, loading } = useProjectStatus(projectId);

    const loadingRef = useLoading<HTMLUListElement>(
        loading,
        '[data-loading-project-lifecycle-summary=true]',
    );
    return (
        <Wrapper ref={loadingRef}>
            <LifecycleBox>
                <p>
                    <Counter>
                        <BigNumber
                            value={data?.lifecycleSummary.initial.currentFlags}
                        />

                        <FeatureLifecycleStageIcon
                            aria-hidden='true'
                            stage={{ name: 'initial' }}
                        />
                    </Counter>
                    <span>flags in initial</span>
                </p>
                <AverageDaysStat
                    averageDays={data?.lifecycleSummary.initial.averageDays}
                />
            </LifecycleBox>
            <LifecycleBox>
                <p>
                    <Counter>
                        <BigNumber
                            value={data?.lifecycleSummary.preLive.currentFlags}
                        />

                        <FeatureLifecycleStageIcon
                            aria-hidden='true'
                            stage={{ name: 'pre-live' }}
                        />
                    </Counter>
                    <span>flags in pre-live</span>
                </p>
                <AverageDaysStat
                    averageDays={data?.lifecycleSummary.preLive.averageDays}
                />
            </LifecycleBox>
            <LifecycleBox>
                <p>
                    <Counter>
                        <BigNumber
                            value={data?.lifecycleSummary.live.currentFlags}
                        />

                        <FeatureLifecycleStageIcon
                            aria-hidden='true'
                            stage={{ name: 'live' }}
                        />
                    </Counter>
                    <span>flags in live</span>
                </p>
                <AverageDaysStat
                    averageDays={data?.lifecycleSummary.live.averageDays}
                />
            </LifecycleBox>
            <LifecycleBox>
                <p>
                    <Counter>
                        <BigNumber
                            value={
                                data?.lifecycleSummary.completed.currentFlags
                            }
                        />

                        <FeatureLifecycleStageIcon
                            aria-hidden='true'
                            stage={{ name: 'completed' }}
                        />
                    </Counter>
                    <span>flags in cleanup</span>
                </p>
                <AverageDaysStat
                    averageDays={data?.lifecycleSummary.completed.averageDays}
                />
            </LifecycleBox>
            <LifecycleBox>
                <p>
                    <Counter>
                        <BigNumber
                            value={data?.lifecycleSummary.archived.currentFlags}
                        />

                        <FeatureLifecycleStageIcon
                            aria-hidden='true'
                            stage={{ name: 'archived' }}
                        />
                    </Counter>
                    <span>flags in archived</span>
                </p>
                <Stats>
                    <dt>This month</dt>
                    <dd data-loading-project-lifecycle-summary>
                        {data?.lifecycleSummary.archived.currentFlags ?? 0}{' '}
                        flags archived
                    </dd>
                </Stats>
            </LifecycleBox>
        </Wrapper>
    );
};
