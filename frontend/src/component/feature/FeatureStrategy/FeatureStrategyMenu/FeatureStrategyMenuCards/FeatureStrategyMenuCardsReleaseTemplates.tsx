import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans.ts';
import { Box } from '@mui/material';
import type { StrategyFilterValue } from './FeatureStrategyMenuCards.tsx';
import type { Dispatch, SetStateAction } from 'react';
import {
    FeatureStrategyMenuCardsSection,
    StyledStrategyModalSectionHeader,
} from './FeatureStrategyMenuCardsSection.tsx';
import { NewReleaseTemplateButton } from './NewReleaseTemplateButton.tsx';
import { NoReleaseTemplatesMessage } from './NoReleaseTemplatesMessage.tsx';
import { ReleaseTemplateCard } from './ReleaseTemplateCard.tsx';

const RELEASE_TEMPLATE_DISPLAY_LIMIT = 5;

interface IFeatureStrategyMenuCardsReleaseTemplatesProps {
    projectId: string;
    onAddReleasePlan: (template: IReleasePlanTemplate) => void;
    onReviewReleasePlan: (template: IReleasePlanTemplate) => void;
    filter: StrategyFilterValue;
    setFilter: Dispatch<SetStateAction<StrategyFilterValue>>;
}

export const FeatureStrategyMenuCardsReleaseTemplates = ({
    projectId,
    onAddReleasePlan,
    onReviewReleasePlan,
    filter,
    setFilter,
}: IFeatureStrategyMenuCardsReleaseTemplatesProps) => {
    const { isEnterprise } = useUiConfig();
    const { templates } = useReleasePlanTemplates(projectId, {
        includeRoot: true,
    });
    if (!isEnterprise()) {
        return null;
    }

    const isFiltered = filter === 'releaseTemplates';
    const shouldShowHeader = !isFiltered || templates.length > 0;
    const releaseTemplatesDisplayLimit = isFiltered
        ? 0
        : RELEASE_TEMPLATE_DISPLAY_LIMIT;

    return (
        <Box>
            {shouldShowHeader && (
                <StyledStrategyModalSectionHeader
                    sx={{ justifyContent: 'space-between' }}
                >
                    Release templates
                    <NewReleaseTemplateButton projectId={projectId} />
                </StyledStrategyModalSectionHeader>
            )}
            {!templates.length ? (
                <NoReleaseTemplatesMessage solo={isFiltered} />
            ) : (
                <FeatureStrategyMenuCardsSection
                    limit={releaseTemplatesDisplayLimit}
                    viewMore={() => setFilter('releaseTemplates')}
                    viewMoreLabel='View more templates'
                >
                    {templates.map((template) => (
                        <ReleaseTemplateCard
                            key={template.id}
                            template={template}
                            onAddReleasePlan={onAddReleasePlan}
                            onReviewReleasePlan={onReviewReleasePlan}
                        />
                    ))}
                </FeatureStrategyMenuCardsSection>
            )}
        </Box>
    );
};
