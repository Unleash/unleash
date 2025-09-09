import { styled, Typography, Box, IconButton, Button } from '@mui/material';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard.tsx';
import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import { FeatureReleasePlanCard } from '../FeatureReleasePlanCard/FeatureReleasePlanCard.tsx';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { Link as RouterLink } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig.ts';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon.tsx';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview.ts';
import { useState } from 'react';

const RELEASE_TEMPLATE_DISPLAY_LIMIT = 5;

const StyledContainer = styled(Box)(() => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
}));

const StyledScrollableContent = styled(Box)(({ theme }) => ({
    width: '100%',
    maxHeight: theme.spacing(62),
    overflowY: 'auto',
    padding: theme.spacing(4),
    paddingTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(5),
}));

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(2),
    width: '100%',
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(4, 4, 2, 4),
}));

const StyledSectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    width: '100%',
}));

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

const StyledLink = styled(RouterLink)({
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
});

const StyledViewAllTemplates = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
});

interface IFeatureStrategyMenuCardsProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    onlyReleasePlans: boolean;
    onAddReleasePlan: (template: IReleasePlanTemplate) => void;
    onReviewReleasePlan: (template: IReleasePlanTemplate) => void;
    onClose: () => void;
}

export const FeatureStrategyMenuCards = ({
    projectId,
    featureId,
    environmentId,
    onAddReleasePlan,
    onReviewReleasePlan,
    onClose,
}: IFeatureStrategyMenuCardsProps) => {
    const { isEnterprise } = useUiConfig();

    const { strategies } = useStrategies();
    const { templates } = useReleasePlanTemplates();
    const { project } = useProjectOverview(projectId);

    const [seeAllReleaseTemplates, setSeeAllReleaseTemplates] = useState(false);

    const activeStrategies = strategies.filter(
        (strategy) => !strategy.deprecated,
    );

    const standardStrategies = activeStrategies.filter(
        (strategy) => !strategy.advanced && !strategy.editable,
    );

    const advancedStrategies = activeStrategies.filter(
        (strategy) => strategy.advanced && !strategy.editable,
    );

    const customStrategies = activeStrategies.filter(
        (strategy) => strategy.editable,
    );

    const projectDefaultStrategy = project?.environments?.find(
        (env) => env.environment === environmentId,
    )?.defaultStrategy || {
        name: 'flexibleRollout',
        title: '100% of all users',
    };

    const defaultStrategy = {
        name: projectDefaultStrategy.name || 'flexibleRollout',
        displayName: 'Default strategy',
        description:
            projectDefaultStrategy.title ||
            'This is the default strategy defined for this environment in the project',
    };

    const renderReleasePlanTemplates = () => {
        if (!isEnterprise()) {
            return null;
        }

        const slicedTemplates = seeAllReleaseTemplates
            ? templates
            : templates.slice(0, RELEASE_TEMPLATE_DISPLAY_LIMIT);

        return (
            <Box>
                <StyledSectionHeader>
                    <Typography color='inherit' variant='body2'>
                        Release templates
                    </Typography>
                </StyledSectionHeader>
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
                    <StyledGrid>
                        {slicedTemplates.map((template) => (
                            <FeatureReleasePlanCard
                                key={template.id}
                                template={template}
                                onClick={() => onAddReleasePlan(template)}
                                onPreviewClick={() =>
                                    onReviewReleasePlan(template)
                                }
                            />
                        ))}
                        {slicedTemplates.length < templates.length &&
                            templates.length >
                                RELEASE_TEMPLATE_DISPLAY_LIMIT && (
                                <StyledViewAllTemplates>
                                    <Button
                                        variant='text'
                                        size='small'
                                        onClick={() =>
                                            setSeeAllReleaseTemplates(true)
                                        }
                                    >
                                        View all available templates
                                    </Button>
                                </StyledViewAllTemplates>
                            )}
                    </StyledGrid>
                )}
            </Box>
        );
    };

    return (
        <StyledContainer>
            <StyledHeader>
                <Typography variant='h2'>Add strategy</Typography>
                <IconButton
                    size='small'
                    onClick={onClose}
                    edge='end'
                    aria-label='close'
                >
                    <CloseIcon fontSize='small' />
                </IconButton>
            </StyledHeader>
            <StyledScrollableContent>
                <Box>
                    <StyledGrid>
                        <StyledSectionHeader>
                            <Typography color='inherit' variant='body2'>
                                Project default
                            </Typography>
                            <HelpIcon
                                htmlTooltip
                                tooltip={
                                    <>
                                        This is set per project, per
                                        environment, and can be configured{' '}
                                        <StyledLink
                                            to={`/projects/${projectId}/settings/default-strategy`}
                                        >
                                            here
                                        </StyledLink>
                                    </>
                                }
                                size='16px'
                            />
                        </StyledSectionHeader>
                        <StyledSectionHeader>
                            <Typography color='inherit' variant='body2'>
                                Standard strategies
                            </Typography>
                        </StyledSectionHeader>
                    </StyledGrid>
                    <StyledGrid>
                        <FeatureStrategyMenuCard
                            projectId={projectId}
                            featureId={featureId}
                            environmentId={environmentId}
                            strategy={defaultStrategy}
                            defaultStrategy
                            onClose={onClose}
                        />
                        {standardStrategies.map((strategy) => (
                            <FeatureStrategyMenuCard
                                key={strategy.name}
                                projectId={projectId}
                                featureId={featureId}
                                environmentId={environmentId}
                                strategy={strategy}
                                onClose={onClose}
                            />
                        ))}
                    </StyledGrid>
                </Box>
                {renderReleasePlanTemplates()}
                {advancedStrategies.length > 0 && (
                    <Box>
                        <StyledSectionHeader>
                            <Typography color='inherit' variant='body2'>
                                Advanced strategies
                            </Typography>
                        </StyledSectionHeader>
                        <StyledGrid>
                            {advancedStrategies.map((strategy) => (
                                <FeatureStrategyMenuCard
                                    key={strategy.name}
                                    projectId={projectId}
                                    featureId={featureId}
                                    environmentId={environmentId}
                                    strategy={strategy}
                                    onClose={onClose}
                                />
                            ))}
                        </StyledGrid>
                    </Box>
                )}
                {customStrategies.length > 0 && (
                    <Box>
                        <StyledSectionHeader>
                            <Typography color='inherit' variant='body2'>
                                Custom strategies
                            </Typography>
                        </StyledSectionHeader>
                        <StyledGrid>
                            {customStrategies.map((strategy) => (
                                <FeatureStrategyMenuCard
                                    key={strategy.name}
                                    projectId={projectId}
                                    featureId={featureId}
                                    environmentId={environmentId}
                                    strategy={strategy}
                                    onClose={onClose}
                                />
                            ))}
                        </StyledGrid>
                    </Box>
                )}
            </StyledScrollableContent>
        </StyledContainer>
    );
};
