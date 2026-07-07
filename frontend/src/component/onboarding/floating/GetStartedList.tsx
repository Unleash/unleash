import {
    Button,
    LinearProgress,
    Link,
    styled,
    Typography,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';

const SectionLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.secondary,
    padding: theme.spacing(2, 2, 1, 2),
}));

const HighlightCard = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    margin: theme.spacing(0, 2, 1, 2),
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
}));

const HighlightCopy = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    minWidth: 0,
}));

const HighlightTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const HighlightProgress = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: theme.typography.caption.fontSize,
    opacity: 0.9,
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
    width: theme.spacing(10),
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.palette.primary.dark,
    '& .MuiLinearProgress-bar': {
        backgroundColor: theme.palette.primary.contrastText,
    },
}));

const StartButton = styled(Button)(({ theme }) => ({
    flexShrink: 0,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
    '&:hover': {
        backgroundColor: theme.palette.background.elevation1,
    },
}));

const Row = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    margin: theme.spacing(0, 2, 1, 2),
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
}));

const RowTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const LearningItem = styled(Link)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        textDecoration: 'none',
    },
    '& svg': {
        color: theme.palette.text.secondary,
        fontSize: 20,
        flexShrink: 0,
    },
}));

const learningLabItems = [
    {
        label: 'Architecture – How your flags keep working even if Unleash goes offline',
    },
    { label: 'Create on/off kill switches' },
    { label: 'Run experiments' },
    { label: 'Expose features to selected users' },
    { label: 'Roll out features gradually' },
    { label: 'Control payloads with runtime configuration' },
];

interface IGetStartedListProps {
    completedCount: number;
    totalSteps: number;
    onStartSetup: () => void;
    onOpenDemo: () => void;
}

export const GetStartedList = ({
    completedCount,
    totalSteps,
    onStartSetup,
    onOpenDemo,
}: IGetStartedListProps) => (
    <div>
        <SectionLabel>Try Unleash in action</SectionLabel>

        <HighlightCard>
            <HighlightCopy>
                <HighlightTitle>Set up your own project</HighlightTitle>
                <HighlightProgress>
                    <span>
                        {completedCount}/{totalSteps} completed
                    </span>
                    <ProgressBar
                        variant='determinate'
                        value={(completedCount / totalSteps) * 100}
                    />
                </HighlightProgress>
            </HighlightCopy>
            <StartButton
                variant='contained'
                disableElevation
                onClick={onStartSetup}
            >
                Start setup
            </StartButton>
        </HighlightCard>

        <Row>
            <RowTitle>Try a demo project</RowTitle>
            <Button variant='outlined' onClick={onOpenDemo}>
                Open
            </Button>
        </Row>

        <SectionLabel>Unleash learning lab</SectionLabel>

        {learningLabItems.map((item) => (
            <LearningItem
                key={item.label}
                href='#'
                target='_blank'
                rel='noopener noreferrer'
                onClick={(event) => {
                    // Links are out of scope for the demo.
                    event.preventDefault();
                }}
            >
                <PlayCircleOutlineIcon />
                <span>{item.label}</span>
            </LearningItem>
        ))}
    </div>
);
