import { Box, Button, styled } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { FeatureStrategyMenuCardsSection } from '../FeatureStrategyMenu/FeatureStrategyMenuCards/FeatureStrategyMenuCardsSection.tsx';
import { NewReleaseTemplateButton } from '../FeatureStrategyMenu/FeatureStrategyMenuCards/NewReleaseTemplateButton.tsx';
import { NoReleaseTemplatesMessage } from '../FeatureStrategyMenu/FeatureStrategyMenuCards/NoReleaseTemplatesMessage.tsx';
import { ReleaseTemplateCard } from '../FeatureStrategyMenu/FeatureStrategyMenuCards/ReleaseTemplateCard.tsx';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(0, 4, 4, 4),
}));

const StyledBackButton = styled(Button)({
    paddingLeft: 0,
});

const StyledBackIcon = styled(ArrowBackIcon)(({ theme }) => ({
    marginRight: theme.spacing(1),
}));

const StyledToolbar = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
});

interface ITemplateScreenProps {
    projectId: string;
    onAddReleasePlan: (template: IReleasePlanTemplate) => void;
    onReviewReleasePlan: (template: IReleasePlanTemplate) => void;
    onBack?: () => void;
}

export const TemplateScreen = ({
    projectId,
    onAddReleasePlan,
    onReviewReleasePlan,
    onBack,
}: ITemplateScreenProps) => {
    const { templates } = useReleasePlanTemplates(projectId, {
        includeRoot: true,
    });

    return (
        <StyledContainer>
            <StyledToolbar>
                {onBack ? (
                    <StyledBackButton variant='text' onClick={onBack}>
                        <StyledBackIcon />
                        Go back
                    </StyledBackButton>
                ) : (
                    <Box />
                )}
                <NewReleaseTemplateButton projectId={projectId} />
            </StyledToolbar>
            {templates.length ? (
                <FeatureStrategyMenuCardsSection>
                    {templates.map((template) => (
                        <ReleaseTemplateCard
                            key={template.id}
                            template={template}
                            onAddReleasePlan={onAddReleasePlan}
                            onReviewReleasePlan={onReviewReleasePlan}
                        />
                    ))}
                </FeatureStrategyMenuCardsSection>
            ) : (
                <NoReleaseTemplatesMessage solo />
            )}
        </StyledContainer>
    );
};
