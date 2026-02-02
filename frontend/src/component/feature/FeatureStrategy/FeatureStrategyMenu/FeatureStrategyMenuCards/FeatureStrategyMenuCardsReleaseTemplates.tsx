import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ReactComponent as ReleaseTemplateIcon } from 'assets/img/releaseTemplates.svg';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans.ts';
import { Box, Button, styled } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { StrategyFilterValue } from './FeatureStrategyMenuCards.tsx';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    FeatureStrategyMenuCardsSection,
    StyledStrategyModalSectionHeader,
} from './FeatureStrategyMenuCardsSection.tsx';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard.tsx';
import { FeatureStrategyMenuCardAction } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardAction.tsx';
import { FeatureStrategyMenuCardIcon } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardIcon.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker.ts';
import { useHasRootAccess } from 'hooks/useHasAccess.ts';
import { RELEASE_PLAN_TEMPLATE_CREATE } from '@server/types/permissions.ts';
import { Dialogue } from 'component/common/Dialogue/Dialogue.tsx';

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

const StyledLink = styled(RouterLink)({
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
});

interface IFeatureStrategyMenuCardsReleaseTemplatesProps {
    onAddReleasePlan: (template: IReleasePlanTemplate) => void;
    onReviewReleasePlan: (template: IReleasePlanTemplate) => void;
    filter: StrategyFilterValue;
    setFilter: Dispatch<SetStateAction<StrategyFilterValue>>;
}

export const FeatureStrategyMenuCardsReleaseTemplates = ({
    onAddReleasePlan,
    onReviewReleasePlan,
    filter,
    setFilter,
}: IFeatureStrategyMenuCardsReleaseTemplatesProps) => {
    const { isEnterprise } = useUiConfig();
    const { templates } = useReleasePlanTemplates();
    const navigate = useNavigate();
    const { trackEvent } = usePlausibleTracker();

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

    const canCreateTemplate = useHasRootAccess(RELEASE_PLAN_TEMPLATE_CREATE);
    const handleAddTemplateClick = () => {
        if (canCreateTemplate) {
            trackEvent('new-template-from-add-strategy', {
                props: {
                    eventType: 'navigate-to-create-template',
                },
            });
            navigate('/release-templates/create-template');
        } else {
            setNoAccessDialogOpen(true);
            trackEvent('new-template-from-add-strategy', {
                props: {
                    eventType: 'show-no-access-dialog',
                },
            });
        }
    };

    const onClose = () => {
        setNoAccessDialogOpen(false);
    };

    return (
        <Box>
            {shouldShowHeader && (
                <StyledStrategyModalSectionHeader
                    sx={{ justifyContent: 'space-between' }}
                >
                    Release templates
                    <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddTemplateClick}
                        size='small'
                    >
                        New template
                    </Button>
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
                            <StyledLink to='/release-templates'>
                                Configure &gt; Release templates
                            </StyledLink>{' '}
                            in the side menu to make your rollouts more
                            efficient and streamlined. Read more in our{' '}
                            <StyledLink
                                to='https://docs.getunleash.io/concepts/release-templates'
                                target='_blank'
                                rel='noreferrer'
                            >
                                documentation
                            </StyledLink>
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
                You don&apos;t have the privileges to create release templates.
                You must contact your organization admin to get access.{' '}
            </Dialogue>
        </Box>
    );
};
