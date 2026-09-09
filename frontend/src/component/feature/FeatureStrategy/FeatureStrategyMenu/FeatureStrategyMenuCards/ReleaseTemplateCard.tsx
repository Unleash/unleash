import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { Badge } from 'component/common/Badge/Badge.tsx';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard.tsx';
import { FeatureStrategyMenuCardAction } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardAction.tsx';
import { FeatureStrategyMenuCardIcon } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardIcon.tsx';

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
        icon={<FeatureStrategyMenuCardIcon name='releasePlanTemplate' />}
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
