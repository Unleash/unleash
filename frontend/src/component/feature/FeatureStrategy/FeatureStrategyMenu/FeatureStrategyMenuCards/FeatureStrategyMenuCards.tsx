import { styled, Typography, Box, IconButton } from '@mui/material';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard.tsx';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { Link as RouterLink } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig.ts';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon.tsx';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview.ts';
import { useContext, useMemo, useState } from 'react';
import {
    FeatureStrategyMenuCardsSection,
    StyledStrategyModalSectionHeader,
} from './FeatureStrategyMenuCardsSection.tsx';
import { FeatureStrategyMenuCardsReleaseTemplates } from './FeatureStrategyMenuCardsReleaseTemplates.tsx';
import { QuickFilters } from 'component/common/QuickFilters/QuickFilters.tsx';
import {
    PROJECT_DEFAULT_STRATEGY_READ,
    PROJECT_DEFAULT_STRATEGY_WRITE,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions.ts';
import AccessContext from 'contexts/AccessContext.ts';

const FILTERS = [
    { label: 'All', value: null },
    { label: 'Project default', value: 'default' },
    { label: 'Standard strategies', value: 'standard' },
    { label: 'Release templates', value: 'releaseTemplates' },
    { label: 'Advanced strategies', value: 'advanced' },
] as const;

export type StrategyFilterValue = (typeof FILTERS)[number]['value'];

const StyledContainer = styled(Box)(() => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
}));

const StyledScrollableContent = styled(Box)(({ theme }) => ({
    width: '100%',
    maxHeight: theme.spacing(62),
    overflowY: 'auto',
    padding: theme.spacing(4),
    paddingTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(5),
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(4, 4, 2, 4),
}));

const StyledFiltersContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(0, 4, 5, 4),
}));

const StyledLink = styled(RouterLink)({
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
});

interface IFeatureStrategyMenuCardsProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    onAddReleasePlan: (template: IReleasePlanTemplate) => void;
    onReviewReleasePlan: (template: IReleasePlanTemplate) => void;
    onClose: () => void;
}

export const FeatureStrategyMenuCards = ({
    projectId,
    featureId,
    environmentId,
    onAddReleasePlan,
    onReviewReleasePlan,
    onClose,
}: IFeatureStrategyMenuCardsProps) => {
    const { isEnterprise } = useUiConfig();
    const { hasAccess } = useContext(AccessContext);

    const { strategies } = useStrategies();
    const { project } = useProjectOverview(projectId);

    const [filter, setFilter] = useState<StrategyFilterValue>(null);

    const activeStrategies = strategies.filter(
        (strategy) => !strategy.deprecated,
    );

    const standardStrategies = activeStrategies.filter(
        (strategy) => !strategy.advanced && !strategy.editable,
    );

    const advancedStrategies = activeStrategies.filter(
        (strategy) => strategy.advanced && !strategy.editable,
    );

    const customStrategies = activeStrategies.filter(
        (strategy) => strategy.editable,
    );

    const projectDefaultStrategy = project?.environments?.find(
        (env) => env.environment === environmentId,
    )?.defaultStrategy || {
        name: 'flexibleRollout',
        title: '100% of all users',
    };

    const defaultStrategy = {
        name: projectDefaultStrategy.name || 'flexibleRollout',
        displayName: 'Default strategy',
        description:
            projectDefaultStrategy.title ||
            'This is the default strategy defined for this environment in the project',
    };

    const availableFilters = useMemo(
        () =>
            FILTERS.filter(({ value }) => {
                if (value === 'releaseTemplates') return isEnterprise();
                if (value === 'advanced')
                    return (
                        advancedStrategies.length > 0 ||
                        customStrategies.length > 0
                    );
                return true;
            }),
        [isEnterprise, advancedStrategies.length, customStrategies.length],
    );

    const shouldRender = (key: StrategyFilterValue) => {
        return filter === null || filter === key;
    };

    const hasAccessToDefaultStrategyConfig = hasAccess(
        [
            UPDATE_PROJECT,
            PROJECT_DEFAULT_STRATEGY_READ,
            PROJECT_DEFAULT_STRATEGY_WRITE,
        ],
        projectId,
    );

    return (
        <StyledContainer>
            <StyledHeader>
                <Typography variant='h2'>Add strategy</Typography>
                <IconButton
                    size='small'
                    onClick={onClose}
                    edge='end'
                    aria-label='close'
                >
                    <CloseIcon fontSize='small' />
                </IconButton>
            </StyledHeader>
            <StyledFiltersContainer>
                <QuickFilters
                    filters={availableFilters}
                    value={filter}
                    onChange={setFilter}
                />
            </StyledFiltersContainer>
            <StyledScrollableContent>
                {(shouldRender('default') || shouldRender('standard')) && (
                    <Box>
                        <FeatureStrategyMenuCardsSection>
                            {shouldRender('default') && (
                                <StyledStrategyModalSectionHeader>
                                    <Typography color='inherit' variant='body2'>
                                        Project default
                                    </Typography>
                                    <HelpIcon
                                        htmlTooltip
                                        tooltip={
                                            hasAccessToDefaultStrategyConfig ? (
                                                <>
                                                    This is set per project, per
                                                    environment, and can be
                                                    configured{' '}
                                                    <StyledLink
                                                        to={`/projects/${projectId}/settings/default-strategy`}
                                                    >
                                                        here
                                                    </StyledLink>
                                                </>
                                            ) : (
                                                <>
                                                    This is set per project, per
                                                    environment. Contact project
                                                    owner to change it.
                                                </>
                                            )
                                        }
                                        size='16px'
                                    />
                                </StyledStrategyModalSectionHeader>
                            )}
                            {shouldRender('standard') && (
                                <StyledStrategyModalSectionHeader>
                                    <Typography color='inherit' variant='body2'>
                                        Standard strategies
                                    </Typography>
                                </StyledStrategyModalSectionHeader>
                            )}
                        </FeatureStrategyMenuCardsSection>
                        <FeatureStrategyMenuCardsSection>
                            {shouldRender('default') && (
                                <FeatureStrategyMenuCard
                                    projectId={projectId}
                                    featureId={featureId}
                                    environmentId={environmentId}
                                    strategy={defaultStrategy}
                                    defaultStrategy
                                    onClose={onClose}
                                />
                            )}
                            {shouldRender('standard') && (
                                <>
                                    {standardStrategies.map((strategy) => (
                                        <FeatureStrategyMenuCard
                                            key={strategy.name}
                                            projectId={projectId}
                                            featureId={featureId}
                                            environmentId={environmentId}
                                            strategy={strategy}
                                            onClose={onClose}
                                        />
                                    ))}
                                </>
                            )}
                        </FeatureStrategyMenuCardsSection>
                    </Box>
                )}
                {shouldRender('releaseTemplates') && (
                    <FeatureStrategyMenuCardsReleaseTemplates
                        onAddReleasePlan={onAddReleasePlan}
                        onReviewReleasePlan={onReviewReleasePlan}
                        filter={filter}
                        setFilter={setFilter}
                    />
                )}
                {shouldRender('advanced') && (
                    <>
                        {advancedStrategies.length > 0 && (
                            <FeatureStrategyMenuCardsSection title='Advanced strategies'>
                                {advancedStrategies.map((strategy) => (
                                    <FeatureStrategyMenuCard
                                        key={strategy.name}
                                        projectId={projectId}
                                        featureId={featureId}
                                        environmentId={environmentId}
                                        strategy={strategy}
                                        onClose={onClose}
                                    />
                                ))}
                            </FeatureStrategyMenuCardsSection>
                        )}
                        {customStrategies.length > 0 && (
                            <FeatureStrategyMenuCardsSection title='Custom strategies'>
                                {customStrategies.map((strategy) => (
                                    <FeatureStrategyMenuCard
                                        key={strategy.name}
                                        projectId={projectId}
                                        featureId={featureId}
                                        environmentId={environmentId}
                                        strategy={strategy}
                                        onClose={onClose}
                                    />
                                ))}
                            </FeatureStrategyMenuCardsSection>
                        )}
                    </>
                )}
            </StyledScrollableContent>
        </StyledContainer>
    );
};
