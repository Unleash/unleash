import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    LinearProgress,
    Typography,
    linearProgressClasses,
    styled,
} from '@mui/material';
import { CheckCircle, CircleOutlined, ExpandMore } from '@mui/icons-material';
import { ITutorialTopic } from '../demo-topics';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    maxWidth: theme.spacing(30),
    zIndex: theme.zIndex.snackbar,
    '&&&': {
        borderRadius: 0,
        borderTopLeftRadius: theme.shape.borderRadiusLarge,
        borderTopRightRadius: theme.shape.borderRadiusLarge,
    },
    '&:before': {
        display: 'none',
    },
    '& .expand-icon': {
        position: 'absolute',
        right: theme.spacing(2),
        fontSize: theme.fontSizes.mainHeader,
        transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    },
    '&.Mui-expanded .expand-icon': {
        transform: 'rotate(180deg)',
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    '& .MuiAccordionSummary-content': {
        flexDirection: 'column',
        alignItems: 'center',
    },
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderTopLeftRadius: theme.shape.borderRadiusLarge,
    borderTopRightRadius: theme.shape.borderRadiusLarge,
}));

const StyledExpandMoreIcon = styled(ExpandMore)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
}));

const StyledTitle = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
}));

const StyledProgress = styled('div')(({ theme }) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
    width: '100%',
    height: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.primary.dark,
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.primary.contrastText,
    },
}));

const StyledStep = styled('li', {
    shouldForwardProp: prop => prop !== 'selected' && prop !== 'completed',
})<{ selected?: boolean; completed?: boolean }>(
    ({ theme, selected, completed }) => ({
        padding: theme.spacing(1),
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
        gap: theme.spacing(1),
        backgroundColor: theme.palette.background.elevation2,
        ...(selected && {
            backgroundColor: theme.palette.secondary.light,
            fontWeight: theme.typography.fontWeightBold,
            border: `1px solid ${theme.palette.primary.main}`,
        }),
        ...(completed && {
            backgroundColor: theme.palette.background.elevation1,
            textDecoration: 'line-through',
        }),
    })
);

const StyledCheckCircle = styled(CheckCircle)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: theme.fontSizes.bodySize,
}));

const StyledCircleOutlined = styled(CircleOutlined)(({ theme }) => ({
    color: theme.palette.neutral.main,
    fontSize: theme.fontSizes.bodySize,
}));

const StyledStepIcon = styled(ExpandMore)(({ theme }) => ({
    transform: 'rotate(-90deg)',
    fontSize: theme.fontSizes.bodySize,
}));

const StyledButton = styled(Button)(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(2),
    '&&&': {
        fontSize: theme.fontSizes.smallBody,
    },
}));

interface IDemoTopicsProps {
    expanded: boolean;
    setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    steps: number[];
    currentTopic: number;
    setCurrentTopic: (topic: number) => void;
    topics: ITutorialTopic[];
}

export const DemoTopics = ({
    expanded,
    setExpanded,
    steps,
    currentTopic,
    setCurrentTopic,
    topics,
}: IDemoTopicsProps) => {
    const completedSteps = steps.reduce((acc, step) => acc + (step || 0), 0);
    const totalSteps = topics.flatMap(({ steps }) => steps).length;
    const percentage = (completedSteps / totalSteps) * 100;

    return (
        <StyledAccordion
            expanded={expanded}
            onChange={() => setExpanded(expanded => !expanded)}
        >
            <StyledAccordionSummary>
                <StyledTitle>
                    <Typography fontWeight="bold">Unleash tutorial</Typography>
                    <StyledExpandMoreIcon className="expand-icon" />
                </StyledTitle>
                <StyledSubtitle>
                    Complete all steps to finish tutorial
                </StyledSubtitle>
                <StyledProgress>
                    <Typography variant="body2">
                        {percentage.toFixed()}%
                    </Typography>
                    <StyledLinearProgress
                        variant="determinate"
                        value={percentage}
                    />
                </StyledProgress>
            </StyledAccordionSummary>
            <AccordionDetails>
                <Typography variant="body2" paddingTop={1}>
                    The steps will guide you
                </Typography>
                {topics.map((topic, index) => {
                    const selected = currentTopic === index;
                    const completed = steps[index] === topic.steps.length;
                    return (
                        <StyledStep
                            key={topic.title}
                            onClick={() => setCurrentTopic(index)}
                            selected={selected}
                            completed={completed}
                        >
                            <ConditionallyRender
                                condition={completed}
                                show={<StyledCheckCircle />}
                                elseShow={<StyledCircleOutlined />}
                            />
                            <Typography variant="body2" sx={{ flex: 1 }}>
                                {topic.title}
                            </Typography>
                            <StyledStepIcon />
                        </StyledStep>
                    );
                })}
                <StyledButton variant="outlined">
                    View demo link again
                </StyledButton>
            </AccordionDetails>
        </StyledAccordion>
    );
};
