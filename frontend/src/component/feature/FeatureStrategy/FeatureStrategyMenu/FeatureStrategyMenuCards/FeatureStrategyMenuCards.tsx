import { Link, styled, Typography, Box, IconButton } from '@mui/material';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard.tsx';
import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import { FeatureReleasePlanCard } from '../FeatureReleasePlanCard/FeatureReleasePlanCard.tsx';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig.ts';
import { useUiFlag } from 'hooks/useUiFlag.ts';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon.tsx';

interface IFeatureStrategyMenuCardsProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    onlyReleasePlans: boolean;
    onAddReleasePlan: (template: IReleasePlanTemplate) => void;
    onReviewReleasePlan: (template: IReleasePlanTemplate) => void;
    onClose: () => void;
}

const GridContainer = styled(Box)(() => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
}));

const ScrollableContent = styled(Box)(({ theme }) => ({
    width: '100%',
    maxHeight: '70vh',
    overflowY: 'auto',
    padding: theme.spacing(4),
    paddingTop: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const GridSection = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(1.5),
    width: '100%',
}));

const CardWrapper = styled(Box)(() => ({
    width: '100%',
    minWidth: 0,
}));

const TitleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(4, 4, 2, 4),
}));

const TitleText = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    margin: 0,
}));

const SectionTitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
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

const EmptyStateContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: theme.palette.neutral.light,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(3),
    width: 'auto',
}));

const EmptyStateTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
}));

const EmptyStateDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
}));

const ClickableBoldText = styled(Link)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    cursor: 'pointer',
    '&:hover': {
        textDecoration: 'underline',
    },
}));

export const FeatureStrategyMenuCards = ({
    projectId,
    featureId,
    environmentId,
    onlyReleasePlans,
    onAddReleasePlan,
    onReviewReleasePlan,
    onClose,
}: IFeatureStrategyMenuCardsProps) => {
    const { isEnterprise } = useUiConfig();
    const releasePlansEnabled = useUiFlag('releasePlans');

    const { strategies } = useStrategies();
    const { templates } = useReleasePlanTemplates();
    const navigate = useNavigate();

    const activeStrategies = strategies.filter(
        (strategy) => !strategy.deprecated,
    );

    const standardStrategies = activeStrategies.filter(
        (strategy) => !strategy.advanced && !strategy.editable,
    );

    const advancedAndCustomStrategies = activeStrategies.filter(
        (strategy) => strategy.editable || strategy.advanced,
    );

    const defaultStrategy = {
        name: 'flexibleRollout',
        displayName: 'Default strategy',
        description:
            'This is the default strategy defined for this environment in the project',
    };

    const renderReleasePlanTemplates = () => {
        if (!isEnterprise() || !releasePlansEnabled) {
            return null;
        }

        return (
            <Box>
                <SectionTitle>
                    <Typography color='inherit' variant='body2'>
                        Release templates
                    </Typography>
                    <HelpIcon
                        tooltip='Use a predefined template to roll out features to users'
                        size='16px'
                    />
                </SectionTitle>
                {!templates.length ? (
                    <EmptyStateContainer>
                        <EmptyStateTitle>
                            <StyledIcon>
                                <FactCheckOutlinedIcon />
                            </StyledIcon>
                            Create your own release templates
                        </EmptyStateTitle>
                        <EmptyStateDescription>
                            Standardize your rollouts and save time by reusing
                            predefined strategies. Find release templates in the
                            side menu under{' '}
                            <ClickableBoldText
                                onClick={() => navigate('/release-templates')}
                            >
                                Configure &gt; Release templates
                            </ClickableBoldText>
                        </EmptyStateDescription>
                    </EmptyStateContainer>
                ) : (
                    <GridSection>
                        {templates.map((template) => (
                            <CardWrapper key={template.id}>
                                <FeatureReleasePlanCard
                                    template={template}
                                    onClick={() => onAddReleasePlan(template)}
                                    onPreviewClick={() =>
                                        onReviewReleasePlan(template)
                                    }
                                />
                            </CardWrapper>
                        ))}
                    </GridSection>
                )}
            </Box>
        );
    };

    return (
        <GridContainer>
            <TitleRow>
                <TitleText variant='h2'>
                    {onlyReleasePlans ? 'Select template' : 'Add configuration'}
                </TitleText>
                <IconButton
                    size='small'
                    onClick={onClose}
                    edge='end'
                    aria-label='close'
                >
                    <CloseIcon fontSize='small' />
                </IconButton>
            </TitleRow>
            <ScrollableContent>
                {onlyReleasePlans ? (
                    renderReleasePlanTemplates()
                ) : (
                    <>
                        <Box>
                            <SectionTitle>
                                <Typography color='inherit' variant='body2'>
                                    Standard strategies
                                </Typography>
                                <HelpIcon
                                    tooltip='Standard strategies let you enable a feature only for a specified audience. Select a starting setup, then customize your strategy with targeting and variants.'
                                    size='16px'
                                />
                            </SectionTitle>
                            <GridSection>
                                <CardWrapper key={defaultStrategy.name}>
                                    <FeatureStrategyMenuCard
                                        projectId={projectId}
                                        featureId={featureId}
                                        environmentId={environmentId}
                                        strategy={defaultStrategy}
                                        defaultStrategy
                                        onClose={onClose}
                                    />
                                </CardWrapper>
                                {standardStrategies.map((strategy) => (
                                    <CardWrapper key={strategy.name}>
                                        <FeatureStrategyMenuCard
                                            projectId={projectId}
                                            featureId={featureId}
                                            environmentId={environmentId}
                                            strategy={strategy}
                                            onClose={onClose}
                                        />
                                    </CardWrapper>
                                ))}
                            </GridSection>
                        </Box>
                        {renderReleasePlanTemplates()}
                        {advancedAndCustomStrategies.length > 0 && (
                            <Box>
                                <SectionTitle>
                                    <Typography color='inherit' variant='body2'>
                                        Custom and advanced strategies
                                    </Typography>
                                    <HelpIcon
                                        tooltip='Advanced strategies let you target based on specific properties. Custom activation strategies let you define your own activation strategies to use with Unleash.'
                                        size='16px'
                                    />
                                </SectionTitle>
                                <GridSection>
                                    {advancedAndCustomStrategies.map(
                                        (strategy) => (
                                            <CardWrapper key={strategy.name}>
                                                <FeatureStrategyMenuCard
                                                    projectId={projectId}
                                                    featureId={featureId}
                                                    environmentId={
                                                        environmentId
                                                    }
                                                    strategy={strategy}
                                                    onClose={onClose}
                                                />
                                            </CardWrapper>
                                        ),
                                    )}
                                </GridSection>
                            </Box>
                        )}
                    </>
                )}
            </ScrollableContent>
        </GridContainer>
    );
};
