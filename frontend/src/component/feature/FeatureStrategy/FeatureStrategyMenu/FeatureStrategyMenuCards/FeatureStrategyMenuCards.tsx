import { styled, Typography, Box, IconButton } from '@mui/material';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard.tsx';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig.ts';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon.tsx';
import { type Dispatch, type SetStateAction, useContext, useMemo } from 'react';
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
import { formatStrategyName } from 'utils/strategyNames.tsx';
import { FeatureStrategyMenuCardAction } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardAction.tsx';
import { formatCreateStrategyPath } from '../../FeatureStrategyCreate/FeatureStrategyCreate.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker.ts';
import { FeatureStrategyMenuCardsDefaultStrategy } from './FeatureStrategyMenuCardsDefaultStrategy.tsx';
import type { IStrategy } from 'interfaces/strategy.ts';
import { FeatureStrategyMenuCardIcon } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardIcon.tsx';

const FILTERS = [
    { label: 'All', value: null },
    { label: 'Project default', value: 'default' },
    { label: 'Standard strategies', value: 'standard' },
    { label: 'Release templates', value: 'releaseTemplates' },
    { label: 'Advanced strategies', value: 'advanced' },
    { label: 'Custom strategies', value: 'custom' },
] as const;

export type StrategyFilterValue = (typeof FILTERS)[number]['value'];

const StyledContainer = styled(Box)(() => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
}));

const StyledScrollableContent = styled(Box)(({ theme }) => ({
    width: theme.breakpoints.values.md,
    height: '100%',
    overflowY: 'auto',
    padding: theme.spacing(4),
    paddingTop: theme.spacing(2),
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
    padding: theme.spacing(0, 4, 3, 4),
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
    filter: StrategyFilterValue;
    setFilter: Dispatch<SetStateAction<StrategyFilterValue>>;
    onAddReleasePlan: (template: IReleasePlanTemplate) => void;
    onReviewReleasePlan: (template: IReleasePlanTemplate) => void;
    onClose: () => void;
}

export const FeatureStrategyMenuCards = ({
    projectId,
    featureId,
    environmentId,
    filter,
    setFilter,
    onAddReleasePlan,
    onReviewReleasePlan,
    onClose,
}: IFeatureStrategyMenuCardsProps) => {
    const { isEnterprise } = useUiConfig();
    const { hasAccess } = useContext(AccessContext);
    const { trackEvent } = usePlausibleTracker();
    const navigate = useNavigate();

    const { strategies } = useStrategies();

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

    const availableFilters = useMemo(
        () =>
            FILTERS.filter(({ value }) => {
                if (value === 'releaseTemplates') return isEnterprise();
                if (value === 'advanced') return advancedStrategies.length > 0;
                if (value === 'custom') return customStrategies.length > 0;
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

    const projectDefaultTooltip = hasAccessToDefaultStrategyConfig ? (
        <>
            This is set per project, per environment, and can be configured{' '}
            <StyledLink to={`/projects/${projectId}/settings/default-strategy`}>
                here
            </StyledLink>
        </>
    ) : (
        <>
            This is set per project, per environment. Contact project owner to
            change it.
        </>
    );

    const renderStrategy = (strategy: IStrategy) => {
        const name = strategy.displayName || formatStrategyName(strategy.name);

        return (
            <FeatureStrategyMenuCard
                key={strategy.name}
                name={name}
                description={strategy.description}
                icon={<FeatureStrategyMenuCardIcon name={strategy.name} />}
            >
                <FeatureStrategyMenuCardAction
                    onClick={() =>
                        onConfigure({
                            strategyName: strategy.name,
                            strategyDisplayName: name,
                        })
                    }
                >
                    Configure
                </FeatureStrategyMenuCardAction>
            </FeatureStrategyMenuCard>
        );
    };

    const onConfigure = ({
        strategyName,
        strategyDisplayName,
        isDefault,
    }: {
        strategyName: string;
        strategyDisplayName?: string;
        isDefault?: boolean;
    }) => {
        const createStrategyPath = formatCreateStrategyPath(
            projectId,
            featureId,
            environmentId,
            strategyName,
            isDefault,
        );

        trackEvent('strategy-add', {
            props: {
                buttonTitle: strategyDisplayName || strategyName,
            },
        });

        navigate(createStrategyPath);
        onClose();
    };

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
                                        tooltip={projectDefaultTooltip}
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
                                <FeatureStrategyMenuCardsDefaultStrategy
                                    projectId={projectId}
                                    environmentId={environmentId}
                                    featureId={featureId}
                                    onConfigure={onConfigure}
                                    onClose={onClose}
                                />
                            )}
                            {shouldRender('standard') && (
                                <>{standardStrategies.map(renderStrategy)}</>
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
                {shouldRender('advanced') && advancedStrategies.length > 0 && (
                    <FeatureStrategyMenuCardsSection title='Advanced strategies'>
                        {advancedStrategies.map(renderStrategy)}
                    </FeatureStrategyMenuCardsSection>
                )}
                {shouldRender('custom') && customStrategies.length > 0 && (
                    <FeatureStrategyMenuCardsSection title='Custom strategies'>
                        {customStrategies.map(renderStrategy)}
                    </FeatureStrategyMenuCardsSection>
                )}
            </StyledScrollableContent>
        </StyledContainer>
    );
};
