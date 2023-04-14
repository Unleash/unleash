import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
    styled,
    useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Joyride, {
    ACTIONS,
    CallBackProps,
    EVENTS,
    STATUS,
    Step,
} from 'react-joyride';
import { Badge } from 'component/common/Badge/Badge';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useEffect, useState } from 'react';

interface ITutorialStep {
    title: string;
    steps: Step[];
}

const STEPS: ITutorialStep[] = [
    {
        title: 'Enable/disable a feature toggle',
        steps: [
            {
                target: 'button[data-testid="IMPORT_BUTTON"]',
                title: (
                    <Typography fontWeight="bold">
                        Enable/disable a feature toggle
                    </Typography>
                ),
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            The simplest way to use a feature toggle is to
                            enable or disable it for everyone (on/off).
                        </Typography>
                        <Badge
                            sx={{ marginTop: 2 }}
                            icon={<InfoOutlinedIcon />}
                        >
                            Look at the demo page when toggling!
                        </Badge>
                    </>
                ),
                disableBeacon: true,
            },
        ],
    },
    {
        title: 'Slack example',
        steps: [
            {
                target: 'a[href="https://slack.unleash.run"]',
                title: (
                    <Typography fontWeight="bold">Join us on Slack!</Typography>
                ),
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            Join our community in Slack. This is just an example
                            and not part of the final guide.
                        </Typography>
                    </>
                ),
            },
        ],
    },
];

// const STEPS: Step[] = [
//     {
//         target: 'button[data-testid="IMPORT_BUTTON"]',
//         title: (
//             <Typography fontWeight="bold">
//                 Enable/disable a feature toggle
//             </Typography>
//         ),
//         content: (
//             <>
//                 <Typography
//                     variant="body2"
//                     color="text.secondary"
//                     paddingBottom={2}
//                 >
//                     The simplest way to use a feature toggle is to enable or
//                     disable it for everyone (on/off).
//                 </Typography>
//                 <Badge icon={<InfoOutlinedIcon />}>
//                     Look at the demo page when toggling!
//                 </Badge>
//             </>
//         ),
//         disableBeacon: true,
//     },
//     {
//         target: 'a[href="https://slack.unleash.run"]',
//         content: (
//             <>
//                 <Typography>
//                     The simplest way to use a feature toggle is to enable or
//                     disable it for everyone (on/off).
//                 </Typography>
//                 <Badge>Look at the demo page when toggling!</Badge>
//             </>
//         ),
//         title: 'Enable/disable a feature toggle',
//     },
// ];

const StyledDiv = styled('div')(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    maxWidth: theme.spacing(30),
    zIndex: theme.zIndex.fab,
    '&&&': {
        borderRadius: 0,
        borderTopLeftRadius: theme.shape.borderRadiusLarge,
        borderTopRightRadius: theme.shape.borderRadiusLarge,
    },
    '&:before': {
        display: 'none',
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    '& .MuiAccordionSummary-content': {
        justifyContent: 'center',
    },
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderTopLeftRadius: theme.shape.borderRadiusLarge,
    borderTopRightRadius: theme.shape.borderRadiusLarge,
}));

const StyledExpandMoreIcon = styled(ExpandMoreIcon)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
}));

export const Demo = () => {
    const theme = useTheme();
    const { uiConfig } = useUiConfig();
    const [expanded, setExpanded] = useState(true);
    const [run, setRun] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        setTimeout(() => {
            setRun(true);
        }, 1000);
    }, []);

    const joyrideCallback = (data: CallBackProps) => {
        const { action, index, status, type, step } = data;

        if (action === ACTIONS.UPDATE) {
            const el = document.querySelector(step.target as string);
            if (el) {
                // Smoother than the original joyride scroll
                el.scrollIntoView({
                    block: 'center',
                });
                // TODO: Maybe this should be optional? Adding it as an option to the step?
                el.addEventListener(
                    'click',
                    () => {
                        setStep(index + 1);
                    },
                    {
                        once: true,
                    }
                );
            }
        }

        if (
            ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(
                type
            )
        ) {
            setStep(index + (action === ACTIONS.PREV ? -1 : 1));
        } else if (
            ([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)
        ) {
            setRun(false);
            setExpanded(false);
        }
    };

    if (!uiConfig.flags.demo) return null;

    // TODO: Extract either Accordion or Joyride into separate component?
    // TODO: Finish accordion with steps
    return (
        <StyledDiv>
            <StyledAccordion
                id="unleash-tutorial"
                expanded={expanded}
                onChange={() => setExpanded(expanded => !expanded)}
            >
                <StyledAccordionSummary expandIcon={<StyledExpandMoreIcon />}>
                    <Typography>Unleash tutorial</Typography>
                </StyledAccordionSummary>
                <AccordionDetails>Some steps here...</AccordionDetails>
            </StyledAccordion>
            <Joyride
                // TODO: Should we consider custom components?
                run={run}
                stepIndex={step}
                callback={joyrideCallback}
                steps={STEPS.flatMap(step => step.steps)}
                continuous
                disableScrolling // Original scrolling is too janky, scrolling manually in callback
                disableOverlayClose // TODO: Should we keep this?
                showSkipButton
                hideCloseButton
                spotlightClicks
                // TODO: Keep this?
                floaterProps={{
                    disableAnimation: true,
                    styles: {
                        floater: {
                            filter: `drop-shadow(${theme.palette.primary.main} 0px 0px 3px)`,
                        },
                    },
                }}
                styles={{
                    options: {
                        arrowColor: theme.palette.background.paper,
                        backgroundColor: theme.palette.background.paper,
                        textColor: theme.palette.text.primary,
                        spotlightShadow: '0 0 15px red',
                        primaryColor: theme.palette.primary.main,
                        zIndex: theme.zIndex.snackbar,
                    },
                    spotlight: {
                        // TODO: Should we try adding a pulse animation?
                        borderRadius: theme.shape.borderRadiusMedium,
                        borderColor: theme.palette.primary.main,
                        borderStyle: 'solid',
                        borderWidth: 2,
                        backgroundColor: 'transparent',
                    },
                    overlay: {
                        backgroundColor: 'transparent',
                        mixBlendMode: 'unset',
                    },
                    buttonNext: {
                        outlineColor: theme.palette.primary.main,
                    },
                    buttonSkip: {
                        outlineColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                    },
                }}
            />
        </StyledDiv>
    );
};
