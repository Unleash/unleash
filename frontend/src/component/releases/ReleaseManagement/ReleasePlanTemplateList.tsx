import { Grid } from '@mui/material';
import { ReleasePlanTemplateCard } from './ReleasePlanTemplateCard/ReleasePlanTemplateCard';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

interface ITemplateList {
    templates: IReleasePlanTemplate[];
}

export const ReleasePlanTemplateList: React.FC<ITemplateList> = ({
    templates,
}) => {
    return (
        <>
            {templates.map((template) => (
                <Grid key={template.id} item xs={6} md={4}>
                    <ReleasePlanTemplateCard template={template} />
                </Grid>
            ))}
        </>
    );
};
