import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ReactComponent as ReleaseTemplateIcon } from 'assets/img/releaseTemplates.svg';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans.ts';
import { Box, styled } from '@mui/material';
import type { StrategyFilterValue } from './FeatureStrategyMenuCards.tsx';
import type { Dispatch, SetStateAction } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    FeatureStrategyMenuCardsSection,
    StyledStrategyModalSectionHeader,
} from './FeatureStrategyMenuCardsSection.tsx';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard.tsx';
import { FeatureStrategyMenuCardAction } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardAction.tsx';
import { FeatureStrategyMenuCardIcon } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardIcon.tsx';

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

    if (!isEnterprise()) {
        return null;
    }

    const isFiltered = filter === 'releaseTemplates';
    const shouldShowHeader = !isFiltered || templates.length > 0;
    const releaseTemplatesDisplayLimit = isFiltered
        ? 0
        : RELEASE_TEMPLATE_DISPLAY_LIMIT;

    return (
        <Box>
            {shouldShowHeader && (
                <StyledStrategyModalSectionHeader>
                    Release templates
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
        </Box>
    );
};
