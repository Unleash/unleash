import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import ReleaseTemplateIcon from 'assets/img/releaseTemplates.svg?react';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans.ts';
import { Box, styled } from '@mui/material';
import type { StrategyFilterValue } from './FeatureStrategyMenuCards.tsx';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { QuietLink } from 'component/common/QuietLink';
import {
    FeatureStrategyMenuCardsSection,
    StyledStrategyModalSectionHeader,
} from './FeatureStrategyMenuCardsSection.tsx';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard.tsx';
import { FeatureStrategyMenuCardAction } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardAction.tsx';
import { FeatureStrategyMenuCardIcon } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardIcon.tsx';
import { useEventTracker } from 'hooks/useEventTracker.ts';
import { Dialogue } from 'component/common/Dialogue/Dialogue.tsx';
import { Badge } from 'component/common/Badge/Badge.tsx';
import { NewReleaseTemplateButton } from './NewReleaseTemplateButton.tsx';

const RELEASE_TEMPLATE_DISPLAY_LIMIT = 5;

const StyledIcon = styled('span', {
    shouldForwardProp: (prop) => prop !== 'solo',
})<{ solo?: boolean }>(({ theme, solo }) => ({
    '& > svg': {
        fill: theme.palette.primary.main,
        width: theme.spacing(6),
        height: theme.spacing(6),
        ...(solo && {
            width: theme.spacing(10),
            height: theme.spacing(10),
        }),
    },
    display: 'flex',
    alignItems: 'center',
}));

const StyledNoTemplatesContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'solo',
})<{ solo?: boolean }>(({ theme, solo }) => ({
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.neutral.light,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(2),
    gap: theme.spacing(1),
    width: 'auto',
    ...(solo && {
        backgroundColor: undefined,
        flexDirection: 'column',
        maxWidth: theme.spacing(70),
        margin: 'auto',
        gap: theme.spacing(2.5),
    }),
}));

const StyledNoTemplatesBody = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'solo',
})<{ solo?: boolean }>(({ theme, solo }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    fontSize: theme.typography.caption.fontSize,
    ...(solo && {
        alignItems: 'center',
        textAlign: 'center',
        gap: theme.spacing(2),
        fontSize: theme.typography.body2.fontSize,
    }),
}));

const StyledNoTemplatesTitle = styled('p')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledNoTemplatesDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

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
    const { trackEvent } = useEventTracker();

    const [noAccessDialogOpen, setNoAccessDialogOpen] =
        useState<boolean>(false);

    if (!isEnterprise()) {
        return null;
    }

    const isFiltered = filter === 'releaseTemplates';
    const shouldShowHeader = !isFiltered || templates.length > 0;
    const releaseTemplatesDisplayLimit = isFiltered
        ? 0
        : RELEASE_TEMPLATE_DISPLAY_LIMIT;

    const handleNoAccessClick = () => {
        setNoAccessDialogOpen(true);
        trackEvent('new-template-from-add-strategy', {
            props: {
                eventType: 'show-no-access-dialog',
            },
        });
    };

    const onClose = () => {
        setNoAccessDialogOpen(false);
    };

    const scopeBadge = (template: IReleasePlanTemplate) => (
        <Badge color='disabled'>
            {template.project ? 'Project' : 'Global'}
        </Badge>
    );

    return (
        <Box>
            {shouldShowHeader && (
                <StyledStrategyModalSectionHeader
                    sx={{ justifyContent: 'space-between' }}
                >
                    Release templates
                    <NewReleaseTemplateButton
                        projectId={projectId}
                        onNoAccess={handleNoAccessClick}
                    />
                </StyledStrategyModalSectionHeader>
            )}
            {!templates.length ? (
                <StyledNoTemplatesContainer solo={isFiltered}>
                    <StyledIcon solo={isFiltered}>
                        <ReleaseTemplateIcon />
                    </StyledIcon>
                    <StyledNoTemplatesBody solo={isFiltered}>
                        <StyledNoTemplatesTitle>
                            You don't have any release templates set up yet
                        </StyledNoTemplatesTitle>
                        <StyledNoTemplatesDescription>
                            Go to{' '}
                            <QuietLink to='/release-templates'>
                                Configure &gt; Release templates
                            </QuietLink>{' '}
                            in the side menu to make your rollouts more
                            efficient and streamlined. Read more in our{' '}
                            <QuietLink
                                to='https://docs.getunleash.io/concepts/release-templates'
                                target='_blank'
                                rel='noreferrer'
                            >
                                documentation
                            </QuietLink>
                            .
                        </StyledNoTemplatesDescription>
                    </StyledNoTemplatesBody>
                </StyledNoTemplatesContainer>
            ) : (
                <FeatureStrategyMenuCardsSection
                    limit={releaseTemplatesDisplayLimit}
                    viewMore={() => setFilter('releaseTemplates')}
                    viewMoreLabel='View more templates'
                >
                    {templates.map((template) => (
                        <FeatureStrategyMenuCard
                            key={template.id}
                            name={template.name}
                            description={template.description}
                            icon={
                                <FeatureStrategyMenuCardIcon name='releasePlanTemplate' />
                            }
                            badge={scopeBadge(template)}
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
                    ))}
                </FeatureStrategyMenuCardsSection>
            )}
            <Dialogue
                open={noAccessDialogOpen}
                secondaryButtonText='Close'
                onClose={onClose}
                title='Contact admin to create release templates'
            >
                You don&apos;t have the required permissions to create release
                templates. You must contact your organization admin to get
                access.{' '}
            </Dialogue>
        </Box>
    );
};
