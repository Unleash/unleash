import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import ReleaseTemplateIcon from 'assets/img/releaseTemplates.svg?react';
import { styled } from '@mui/material';
import { Link } from 'react-router';
import { Card } from 'component/common/Card/Card';
import { Truncator } from 'component/common/Truncator/Truncator';
import { ReleasePlanTemplateCardActions } from './ReleasePlanTemplateCardActions.tsx';
import { formatReleaseTemplateEditPath } from 'component/releases/releaseTemplatePaths';
import { ReleasePlanTemplateCardFooter } from './ReleasePlanTemplateCardFooter.tsx';

const StyledCardTitle = styled('h3')(({ theme }) => ({
    margin: 0,
    marginRight: 'auto',
    fontSize: theme.typography.body1.fontSize,
    lineHeight: '1.2',
}));

// Accessible card pattern (https://kittygiraudel.com/2022/04/02/accessible-cards/):
// the title link's ::before overlay makes the whole card clickable without
// wrapping the card in a link.
const StyledCard = styled(Card)({
    position: 'relative',
    '& [data-card-action]': {
        color: 'inherit',
        textDecoration: 'none',
        '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
        },
    },
});

const TemplateCard = ({
    template,
    editPath,
    headerActions,
}: {
    template: IReleasePlanTemplate;
    editPath?: string;
    headerActions?: React.ReactNode;
}) => (
    <StyledCard
        icon={<ReleaseTemplateIcon />}
        title={
            <Truncator title={template.name} arrow component={StyledCardTitle}>
                {editPath ? (
                    <Link data-card-action to={editPath}>
                        {template.name}
                    </Link>
                ) : (
                    template.name
                )}
            </Truncator>
        }
        headerActions={headerActions}
        footer={<ReleasePlanTemplateCardFooter template={template} />}
    >
        {template.description ? (
            <Truncator lines={2} title={template.description} arrow>
                {template.description}
            </Truncator>
        ) : null}
    </StyledCard>
);

export const ReleasePlanTemplateCard = ({
    template,
    projectId,
}: {
    template: IReleasePlanTemplate;
    projectId?: string;
}) => {
    const editPath = formatReleaseTemplateEditPath(template.id, projectId);

    return (
        <TemplateCard
            template={template}
            editPath={editPath}
            headerActions={
                <ReleasePlanTemplateCardActions
                    template={template}
                    projectId={projectId}
                />
            }
        />
    );
};
