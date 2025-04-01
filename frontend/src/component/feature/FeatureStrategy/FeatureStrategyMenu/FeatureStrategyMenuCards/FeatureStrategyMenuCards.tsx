import { Link, styled, Typography, Box, IconButton } from '@mui/material';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import { FeatureReleasePlanCard } from '../FeatureReleasePlanCard/FeatureReleasePlanCard';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

interface IFeatureStrategyMenuCardsProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    onlyReleasePlans: boolean;
    onAddReleasePlan: (template: IReleasePlanTemplate) => void;
    onClose?: () => void;
}

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    padding: theme.spacing(1, 2),
    width: '100%',
}));

const StyledLink = styled(Link)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    cursor: 'pointer',
})) as typeof Link;

const GridContainer = styled(Box)(() => ({
    width: '100%',
}));

const GridSection = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: theme.spacing(1.5),
    padding: theme.spacing(0, 2),
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
    padding: theme.spacing(1, 2),
}));

const TitleText = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

export const FeatureStrategyMenuCards = ({
    projectId,
    featureId,
    environmentId,
    onlyReleasePlans,
    onAddReleasePlan,
    onClose,
}: IFeatureStrategyMenuCardsProps) => {
    const { strategies } = useStrategies();
    const { templates } = useReleasePlanTemplates();
    const navigate = useNavigate();
    const allStrategies = !onlyReleasePlans;

    const preDefinedStrategies = strategies.filter(
        (strategy) => !strategy.deprecated && !strategy.editable,
    );

    const customStrategies = strategies.filter(
        (strategy) => !strategy.deprecated && strategy.editable,
    );

    const defaultStrategy = {
        name: 'flexibleRollout',
        displayName: 'Default strategy',
        description:
            'This is the default strategy defined for this environment in the project',
    };
    return (
        <GridContainer>
            <TitleRow>
                <TitleText>
                    {onlyReleasePlans ? 'Select template' : 'Select strategy'}
                </TitleText>
                {onClose && (
                    <IconButton
                        size='small'
                        onClick={onClose}
                        edge='end'
                        aria-label='close'
                    >
                        <CloseIcon fontSize='small' />
                    </IconButton>
                )}
            </TitleRow>
            {allStrategies ? (
                <>
                    <StyledTypography color='textSecondary'>
                        Default strategy for {environmentId} environment
                    </StyledTypography>
                    <GridSection>
                        <CardWrapper key={defaultStrategy.name}>
                            <FeatureStrategyMenuCard
                                projectId={projectId}
                                featureId={featureId}
                                environmentId={environmentId}
                                strategy={defaultStrategy}
                                defaultStrategy={true}
                            />
                        </CardWrapper>
                    </GridSection>
                </>
            ) : null}
            <ConditionallyRender
                condition={templates.length > 0}
                show={
                    <>
                        <StyledTypography color='textSecondary'>
                            Release templates
                        </StyledTypography>
                        <GridSection>
                            {templates.map((template) => (
                                <CardWrapper key={template.id}>
                                    <FeatureReleasePlanCard
                                        template={template}
                                        onClick={() =>
                                            onAddReleasePlan(template)
                                        }
                                    />
                                </CardWrapper>
                            ))}
                        </GridSection>
                    </>
                }
            />
            <ConditionallyRender
                condition={templates.length === 0 && onlyReleasePlans}
                show={
                    <>
                        <StyledTypography
                            color='textSecondary'
                            sx={{
                                padding: (theme) => theme.spacing(1, 2, 0, 2),
                            }}
                        >
                            <p>No templates created.</p>
                            <p>
                                Go to&nbsp;
                                <StyledLink
                                    onClick={() =>
                                        navigate('/release-templates')
                                    }
                                >
                                    Release templates
                                </StyledLink>
                                &nbsp;to get started
                            </p>
                        </StyledTypography>
                    </>
                }
            />
            {allStrategies ? (
                <>
                    <StyledTypography color='textSecondary'>
                        Predefined strategy types
                    </StyledTypography>
                    <GridSection>
                        {preDefinedStrategies.map((strategy) => (
                            <CardWrapper key={strategy.name}>
                                <FeatureStrategyMenuCard
                                    projectId={projectId}
                                    featureId={featureId}
                                    environmentId={environmentId}
                                    strategy={strategy}
                                />
                            </CardWrapper>
                        ))}
                    </GridSection>
                    <ConditionallyRender
                        condition={customStrategies.length > 0}
                        show={
                            <>
                                <StyledTypography color='textSecondary'>
                                    Custom strategies
                                </StyledTypography>
                                <GridSection>
                                    {customStrategies.map((strategy) => (
                                        <CardWrapper key={strategy.name}>
                                            <FeatureStrategyMenuCard
                                                projectId={projectId}
                                                featureId={featureId}
                                                environmentId={environmentId}
                                                strategy={strategy}
                                            />
                                        </CardWrapper>
                                    ))}
                                </GridSection>
                            </>
                        }
                    />
                </>
            ) : null}
        </GridContainer>
    );
};
