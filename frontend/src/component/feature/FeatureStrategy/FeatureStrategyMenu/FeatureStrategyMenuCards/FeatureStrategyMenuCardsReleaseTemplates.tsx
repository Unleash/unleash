import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import { FeatureReleasePlanCard } from '../FeatureReleasePlanCard/FeatureReleasePlanCard.tsx';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans.ts';
import { Box, Button, styled, Typography } from '@mui/material';
import type { StrategyFilterValue } from './FeatureStrategyMenuCards.tsx';
import type { Dispatch, SetStateAction } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    FeatureStrategyMenuCardsSection,
    StyledStrategyModalSectionHeader,
} from './FeatureStrategyMenuCardsSection.tsx';

const RELEASE_TEMPLATE_DISPLAY_LIMIT = 5;

const StyledIcon = styled('span')(({ theme }) => ({
    width: theme.spacing(3),
    '& > svg': {
        fill: theme.palette.primary.main,
        width: theme.spacing(2.25),
        height: theme.spacing(2.25),
    },
    display: 'flex',
    alignItems: 'center',
}));

const StyledNoTemplatesContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: theme.palette.neutral.light,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(3),
    width: 'auto',
}));

const StyledNoTemplatesTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
}));

const StyledNoTemplatesDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
}));

const StyledViewAllTemplates = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
});

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

    if (!isEnterprise()) {
        return null;
    }

    const slicedTemplates =
        filter === 'releaseTemplates'
            ? templates
            : templates.slice(0, RELEASE_TEMPLATE_DISPLAY_LIMIT);

    return (
        <Box>
            <StyledStrategyModalSectionHeader>
                <Typography color='inherit' variant='body2'>
                    Release templates
                </Typography>
            </StyledStrategyModalSectionHeader>
            {!templates.length ? (
                <StyledNoTemplatesContainer>
                    <StyledNoTemplatesTitle>
                        <StyledIcon>
                            <FactCheckOutlinedIcon />
                        </StyledIcon>
                        Create your own release templates
                    </StyledNoTemplatesTitle>
                    <StyledNoTemplatesDescription>
                        Standardize your rollouts and save time by reusing
                        predefined strategies. Find release templates in the
                        side menu under{' '}
                        <StyledLink to='/release-templates'>
                            Configure &gt; Release templates
                        </StyledLink>
                    </StyledNoTemplatesDescription>
                </StyledNoTemplatesContainer>
            ) : (
                <FeatureStrategyMenuCardsSection>
                    {slicedTemplates.map((template) => (
                        <FeatureReleasePlanCard
                            key={template.id}
                            template={template}
                            onClick={() => onAddReleasePlan(template)}
                            onPreviewClick={() => onReviewReleasePlan(template)}
                        />
                    ))}
                    {slicedTemplates.length < templates.length &&
                        templates.length > RELEASE_TEMPLATE_DISPLAY_LIMIT && (
                            <StyledViewAllTemplates>
                                <Button
                                    variant='text'
                                    size='small'
                                    onClick={() =>
                                        setFilter('releaseTemplates')
                                    }
                                >
                                    View all available templates
                                </Button>
                            </StyledViewAllTemplates>
                        )}
                </FeatureStrategyMenuCardsSection>
            )}
        </Box>
    );
};
