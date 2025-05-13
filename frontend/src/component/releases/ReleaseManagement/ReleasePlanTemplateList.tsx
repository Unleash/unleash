import { Grid, styled } from '@mui/material';
import { ReleasePlanTemplateCard } from './ReleasePlanTemplateCard/ReleasePlanTemplateCard.tsx';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { ReleasesFeedback } from './ReleasesFeedback.tsx';

const StyledGridItem = styled(Grid)({
    minHeight: '180px',
});

interface ITemplateList {
    templates: IReleasePlanTemplate[];
}

export const ReleasePlanTemplateList: React.FC<ITemplateList> = ({
    templates,
}) => {
    return (
        <>
            {templates.map((template) => (
                <StyledGridItem key={template.id} item xs={6} md={4}>
                    <ReleasePlanTemplateCard template={template} />
                </StyledGridItem>
            ))}
            {templates.length > 0 && (
                <StyledGridItem key='feedback' item xs={6} md={4}>
                    <ReleasesFeedback title='Release Templates'>
                        We would love to get your feedback on the concept around
                        release templates so we can bring it into our work going
                        forward
                    </ReleasesFeedback>
                </StyledGridItem>
            )}
        </>
    );
};
