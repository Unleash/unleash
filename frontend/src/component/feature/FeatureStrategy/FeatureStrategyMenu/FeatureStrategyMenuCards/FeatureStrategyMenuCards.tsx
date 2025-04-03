import {
    Link,
    styled,
    Typography,
    Box,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import { FeatureReleasePlanCard } from '../FeatureReleasePlanCard/FeatureReleasePlanCard';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

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
    display: 'flex',
    flexDirection: 'column',
}));

const ScrollableContent = styled(Box)(({ theme }) => ({
    width: '100%',
    maxHeight: '70vh',
    overflowY: 'auto',
    padding: theme.spacing(0, 0, 1, 0),
}));

const GridSection = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(1.5),
    padding: theme.spacing(0, 2),
    marginBottom: theme.spacing(3),
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
    margin: 0,
}));

const SectionTitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(1, 2),
    width: '100%',
}));

const StyledInfoIcon = styled(InfoOutlinedIcon)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

const StyledIcon = styled('div')(({ theme }) => ({
    width: theme.spacing(3),
    '& > svg': {
        fill: theme.palette.primary.main,
        width: theme.spacing(2.25),
        height: theme.spacing(2.25),
    },
    display: 'flex',
    alignItems: 'center',
}));

// Empty state styling
const EmptyStateContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: theme.palette.neutral.light,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(3),
    margin: theme.spacing(0, 2),
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

const BoldText = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

const ClickableBoldText = styled(BoldText)(({ theme }) => ({
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
                <TitleText variant='h2'>
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
            <ScrollableContent>
                {allStrategies ? (
                    <>
                        <SectionTitle>
                            <Typography color='inherit' variant='body2'>
                                Pre-defined strategy types
                            </Typography>
                            <Tooltip
                                title='Select a starting setup, and customize the strategy to your need with targeting and variants'
                                arrow
                            >
                                <StyledInfoIcon />
                            </Tooltip>
                        </SectionTitle>
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
                    </>
                ) : null}
                <ConditionallyRender
                    condition={templates.length < 0}
                    show={
                        <>
                            <SectionTitle>
                                <Typography color='inherit' variant='body2'>
                                    Apply a release template
                                </Typography>
                                <Tooltip
                                    title='Use one of the pre-defined templates defined in your company for rolling out features to users'
                                    arrow
                                >
                                    <StyledInfoIcon />
                                </Tooltip>
                            </SectionTitle>
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
                    elseShow={
                        <EmptyStateContainer>
                            <EmptyStateTitle>
                                <StyledIcon>
                                    <FactCheckOutlinedIcon />
                                </StyledIcon>
                                Create your own templates
                            </EmptyStateTitle>
                            <EmptyStateDescription>
                                Standardize how you do rollouts and make it more
                                efficient without having to set up the same
                                stategies from time to time. You find it in the
                                sidemenu under{' '}
                                <ClickableBoldText
                                    onClick={() =>
                                        navigate('/release-templates')
                                    }
                                >
                                    Configure &gt; Release templates
                                </ClickableBoldText>
                            </EmptyStateDescription>
                        </EmptyStateContainer>
                    }
                />
                <ConditionallyRender
                    condition={templates.length === 0 && onlyReleasePlans}
                    show={
                        <>
                            <StyledTypography
                                color='textSecondary'
                                sx={{
                                    padding: (theme) =>
                                        theme.spacing(1, 2, 0, 2),
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
                        <ConditionallyRender
                            condition={customStrategies.length > 0}
                            show={
                                <>
                                    <SectionTitle>
                                        <Typography
                                            color='inherit'
                                            variant='body2'
                                        >
                                            Custom strategies
                                        </Typography>
                                        <Tooltip
                                            title='Custom strategies you have defined in Unleash'
                                            arrow
                                        >
                                            <StyledInfoIcon />
                                        </Tooltip>
                                    </SectionTitle>
                                    <GridSection>
                                        {customStrategies.map((strategy) => (
                                            <CardWrapper key={strategy.name}>
                                                <FeatureStrategyMenuCard
                                                    projectId={projectId}
                                                    featureId={featureId}
                                                    environmentId={
                                                        environmentId
                                                    }
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
            </ScrollableContent>
        </GridContainer>
    );
};
