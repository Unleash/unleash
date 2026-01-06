import { Grid, styled } from '@mui/material';
import { ReleasePlanTemplateCard } from './ReleasePlanTemplateCard/ReleasePlanTemplateCard.tsx';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

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
        </>
    );
};
