import { styled } from '@mui/material';
import { FeatureLifecycleStageIcon } from 'component/common/FeatureLifecycle/FeatureLifecycleStageIcon';
import { useProjectStatus } from 'hooks/api/getters/useProjectStatus/useProjectStatus';
import useLoading from 'hooks/useLoading';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { FC } from 'react';
import { PrettifyLargeNumber } from 'component/common/PrettifyLargeNumber/PrettifyLargeNumber';
import type { ProjectStatusSchemaLifecycleSummary } from 'openapi';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { lifecycleMessages } from './LifecycleMessages.ts';
import InfoIcon from '@mui/icons-material/Info';
import { getFeatureLifecycleName } from 'component/common/FeatureLifecycle/getFeatureLifecycleName';

const LifecycleBoxContent = styled('div')(({ theme }) => ({
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    minHeight: '100%',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-between',
    transition: 'all 200ms',
    borderRadius: theme.shape.borderRadiusExtraLarge,
    border: `2px solid ${theme.palette.divider}`,
    '&:focus-visible': {
        outline: 'none',
        borderColor: theme.palette.primary.main,
    },
    '&:hover': {
        backgroundColor: theme.palette.table.rowHover,
    },
}));

const LifecycleBoxTooltip: FC<{ text: string }> = ({ text }) => {
    const Container = styled('span')(({ theme }) => ({
        display: 'flex',
        alignItems: 'flex-start',
        gap: theme.spacing(1),
        fontSize: theme.typography.body1.fontSize,
        padding: theme.spacing(1),
    }));
    return (
        <Container>
            <InfoIcon fontSize='small' color='primary' />
            <p>{text}</p>
        </Container>
    );
};

const LifecycleBox = ({
    children,
    tooltipText,
}: {
    children: React.ReactNode;
    tooltipText: string;
}) => {
    return (
        <li>
            <HtmlTooltip
                arrow
                maxWidth='850px'
                title={<LifecycleBoxTooltip text={tooltipText} />}
            >
                <LifecycleBoxContent tabIndex={0}>
                    {children}
                </LifecycleBoxContent>
            </HtmlTooltip>
        </li>
    );
};

const LifecycleList = styled('ul')(({ theme }) => ({
    display: 'grid',
    listStyle: 'none',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: theme.spacing(1),
    justifyContent: 'center',
    padding: 0,
    flex: 'auto',
    margin: 0,
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

const StyledStageTitle = styled('span')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
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
        } else if (averageDays === 1) {
            return '1 day';
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

    const flagWord = (stage: keyof ProjectStatusSchemaLifecycleSummary) => {
        const hasOneFlag = data?.lifecycleSummary[stage].currentFlags === 1;

        return hasOneFlag ? 'Flag' : 'Flags';
    };

    const stageName = (stage: keyof ProjectStatusSchemaLifecycleSummary) => {
        const lifecycleStageName = stage === 'preLive' ? 'pre-live' : stage;
        return (
            <StyledStageTitle>
                {flagWord(stage)} in{' '}
                {getFeatureLifecycleName(lifecycleStageName)}
            </StyledStageTitle>
        );
    };

    const archivedLast30DaysCount =
        data?.lifecycleSummary.archived.last30Days ?? 0;
    const totalArchivedText = `${archivedLast30DaysCount} ${archivedLast30DaysCount === 1 ? 'flag' : 'flags'} archived`;

    return (
        <LifecycleList ref={loadingRef}>
            <LifecycleBox tooltipText={lifecycleMessages.initial}>
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
                    <span>{stageName('initial')}</span>
                </p>
                <AverageDaysStat
                    averageDays={data?.lifecycleSummary.initial.averageDays}
                />
            </LifecycleBox>
            <LifecycleBox tooltipText={lifecycleMessages.preLive}>
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
                    <span>{stageName('preLive')}</span>
                </p>
                <AverageDaysStat
                    averageDays={data?.lifecycleSummary.preLive.averageDays}
                />
            </LifecycleBox>
            <LifecycleBox tooltipText={lifecycleMessages.live}>
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
                    <span>{stageName('live')}</span>
                </p>
                <AverageDaysStat
                    averageDays={data?.lifecycleSummary.live.averageDays}
                />
            </LifecycleBox>
            <LifecycleBox tooltipText={lifecycleMessages.completed}>
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
                    <span>{stageName('completed')}</span>
                </p>
                <AverageDaysStat
                    averageDays={data?.lifecycleSummary.completed.averageDays}
                />
            </LifecycleBox>
            <LifecycleBox tooltipText={lifecycleMessages.archived}>
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
                    <span>{stageName('archived')}</span>
                </p>
                <Stats>
                    <dt>Last 30 days</dt>
                    <dd data-loading-project-lifecycle-summary>
                        {totalArchivedText}
                    </dd>
                </Stats>
            </LifecycleBox>
        </LifecycleList>
    );
};
