import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { Badge } from 'component/common/Badge/Badge.tsx';
import { FeatureStrategyMenuCard } from './FeatureStrategyMenuCard.tsx';
import { FeatureStrategyMenuCardAction } from './FeatureStrategyMenuCardAction.tsx';
import ReleaseTemplateIcon from 'assets/img/releaseTemplates.svg?react';

interface IReleaseTemplateCardProps {
    template: IReleasePlanTemplate;
    onAddReleasePlan: (template: IReleasePlanTemplate) => void;
    onReviewReleasePlan: (template: IReleasePlanTemplate) => void;
}

export const ReleaseTemplateCard = ({
    template,
    onAddReleasePlan,
    onReviewReleasePlan,
}: IReleaseTemplateCardProps) => (
    <FeatureStrategyMenuCard
        name={template.name}
        description={template.description}
        icon={<ReleaseTemplateIcon />}
        badge={
            <Badge color='disabled'>
                {template.project ? 'Project' : 'Global'}
            </Badge>
        }
    >
        <FeatureStrategyMenuCardAction
            onClick={() => onReviewReleasePlan(template)}
        >
            Preview
        </FeatureStrategyMenuCardAction>
        <FeatureStrategyMenuCardAction
            onClick={() => onAddReleasePlan(template)}
        >
            Apply
        </FeatureStrategyMenuCardAction>
    </FeatureStrategyMenuCard>
);
