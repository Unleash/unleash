import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { ReactComponent as ReleaseTemplateIcon } from 'assets/img/releaseTemplates.svg';
import { styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { Card } from 'component/common/Card/Card';
import { Truncator } from 'component/common/Truncator/Truncator';
import { ReleasePlanTemplateCardActions } from './ReleasePlanTemplateCardActions';
import { ReleasePlanTemplateCardFooter } from './ReleasePlanTemplateCardFooter';

const StyledCardLink = styled(Link)(({ theme }) => ({
    color: 'inherit',
    textDecoration: 'none',
    border: 'none',
    padding: '0',
    background: 'transparent',
    fontFamily: theme.typography.fontFamily,
    pointer: 'cursor',
}));

const StyledCardTitle = styled('h3')(({ theme }) => ({
    margin: 0,
    marginRight: 'auto',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: '1.2',
}));

export const ReleasePlanTemplateCard = ({
    template,
}: { template: IReleasePlanTemplate }) => (
    <StyledCardLink to={`/release-management/edit/${template.id}`}>
        <Card
            icon={<ReleaseTemplateIcon />}
            title={
                <Truncator
                    title={template.name}
                    arrow
                    component={StyledCardTitle}
                >
                    {template.name}
                </Truncator>
            }
            headerActions={
                <ReleasePlanTemplateCardActions template={template} />
            }
            footer={<ReleasePlanTemplateCardFooter template={template} />}
        >
            {template.description && (
                <Truncator lines={2} title={template.description} arrow>
                    {template.description}
                </Truncator>
            )}
        </Card>
    </StyledCardLink>
);
