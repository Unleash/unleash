import { Box, Button, styled } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { NewReleaseTemplateButton } from './NewReleaseTemplateButton.tsx';
import { NoReleaseTemplatesMessage } from './NoReleaseTemplatesMessage.tsx';
import { ReleaseTemplateCard } from './ReleaseTemplateCard.tsx';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(0, 3, 3, 3),
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

const StyledCardSection = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: 'repeat(1, 1fr)',
    },
    gap: theme.spacing(2),
    width: '100%',
}));

const StyledSkeletonContainer = styled(Box)({
    width: '100%',
});

const StyledTemplatePlaceholder = styled('div')(({ theme }) => ({
    height: theme.spacing(10),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
}));

const PLACEHOLDER_COUNT = 3;

const TemplatesSkeleton = () => (
    <StyledSkeletonContainer aria-busy='true' aria-label='Loading templates'>
        <StyledCardSection>
            {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
                <StyledTemplatePlaceholder key={index} className='skeleton' />
            ))}
        </StyledCardSection>
    </StyledSkeletonContainer>
);

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
    const { templates, loading } = useReleasePlanTemplates(projectId, {
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
            {loading ? (
                <TemplatesSkeleton />
            ) : templates.length ? (
                <StyledCardSection>
                    {templates.map((template) => (
                        <ReleaseTemplateCard
                            key={template.id}
                            template={template}
                            onAddReleasePlan={onAddReleasePlan}
                            onReviewReleasePlan={onReviewReleasePlan}
                        />
                    ))}
                </StyledCardSection>
            ) : (
                <NoReleaseTemplatesMessage />
            )}
        </StyledContainer>
    );
};
