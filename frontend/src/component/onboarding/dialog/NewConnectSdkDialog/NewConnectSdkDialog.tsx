import {
    Box,
    Button,
    Dialog,
    DialogContent,
    IconButton,
    styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Truncator } from 'component/common/Truncator/Truncator.tsx';
import { NewConnectSdkDialogAside } from './NewConnectSdkDialogAside';
import { useState } from 'react';
import { ConnectSdkDialogStep } from './ConnectSdkDialogStep';
import type { Sdk } from '../sharedTypes';
import { SelectSdk } from './SelectSdk/SelectSdk';
import { SelectSdkSummary } from './SelectSdk/SelectSdkSummary';
import { GenerateApiKey } from './GenerateApiKey/GenerateApiKey';
import { GenerateApiKeySummary } from './GenerateApiKey/GenerateApiKeySummary';
import { ConfigureSdk } from './ConfigureSdk';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(170),
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.sidebar,
    },
}));

const StyledDialogHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexShrink: 0,
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledDialogHeaderMain = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.paper,
    paddingRight: theme.spacing(1.5),
    '& .closeButton': {
        display: 'none',
        [theme.breakpoints.down('md')]: {
            display: 'flex',
        },
    },
}));

const StyledDialogHeaderTitle = styled('h2')(({ theme }) => ({
    padding: theme.spacing(1.5, 3),
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.spacing(2.75),
}));

const StyledDialogHeaderAside = styled(Box)(({ theme }) => ({
    width: theme.spacing(40),
    flexShrink: 0,
    backgroundColor: theme.palette.background.sidebar,
    color: theme.palette.primary.contrastText,
    '& svg': {
        color: theme.palette.primary.contrastText,
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'end',
    paddingRight: theme.spacing(1.5),
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

const StyledDialogBody = styled(Box)({
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
});

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    backgroundColor: theme.palette.background.paper,
    gap: theme.spacing(2),
}));

const StyledDialogFooter = styled(Box)({
    display: 'flex',
    justifyContent: 'flex-end',
});

const StyledDialogAside = styled('aside')(({ theme }) => ({
    width: theme.spacing(40),
    flexShrink: 0,
    backgroundColor: theme.palette.background.sidebar,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

const DialogHeader = ({ onClose }: Pick<IConnectSDKDialogProps, 'onClose'>) => {
    const CloseButton = () => (
        <IconButton size='small' className='closeButton' onClick={onClose}>
            <CloseIcon />
        </IconButton>
    );

    return (
        <StyledDialogHeader>
            <StyledDialogHeaderMain>
                <StyledDialogHeaderTitle>
                    <Truncator>Connect SDK</Truncator>
                </StyledDialogHeaderTitle>
                <CloseButton />
            </StyledDialogHeaderMain>
            <StyledDialogHeaderAside>
                <CloseButton />
            </StyledDialogHeaderAside>
        </StyledDialogHeader>
    );
};

type Step = {
    title: string;
    content: React.ReactNode;
    summary?: React.ReactNode;
};

const InnerDialog = ({
    onClose,
    onFinish,
    project: projectId, // TODO: Cleanup prop names once we remove `onboardingConnectSDKNewDialog`
    environments,
    feature,
}: Omit<IConnectSDKDialogProps, 'open'>) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [expandedStep, setExpandedStep] = useState(0);

    const [sdk, setSdk] = useState<Sdk>();
    const [apiKey, setApiKey] = useState<string>();

    const onSelectSdk = (selectedSdk: Sdk) => {
        setSdk(selectedSdk);
        setCurrentStep(1);
        setExpandedStep(1);
    };

    const onApiKeyChange = (apiKey?: string) => {
        if (!apiKey) {
            setCurrentStep(1);
        }
        setApiKey(apiKey);
    };

    const onApiKeyNext = () => {
        setCurrentStep(2);
        setExpandedStep(2);
    };

    const onSdkConnected = () => setCurrentStep(3);

    const steps: Step[] = [
        {
            title: 'Select SDK',
            content: <SelectSdk sdk={sdk} onSelect={onSelectSdk} />,
            summary: <SelectSdkSummary sdk={sdk} />,
        },
        {
            title: 'Generate API key',
            content: (
                <GenerateApiKey
                    projectId={projectId}
                    sdk={sdk}
                    environments={environments}
                    onApiKeyChange={onApiKeyChange}
                    onNext={onApiKeyNext}
                />
            ),
            summary: <GenerateApiKeySummary apiKey={apiKey} />,
        },
        {
            title: 'Configure the SDK',
            content: (
                <ConfigureSdk
                    projectId={projectId}
                    sdk={sdk}
                    apiKey={apiKey}
                    feature={feature}
                    isActive={currentStep >= 2}
                    onSdkConnected={onSdkConnected}
                />
            ),
        },
    ];

    const complete = currentStep >= steps.length && sdk;

    return (
        <StyledDialog open onClose={onClose}>
            <DialogHeader onClose={onClose} />
            <StyledDialogBody>
                <StyledDialogContent>
                    {steps.map(({ title, content, summary }, index) => {
                        const isCompleted = index < currentStep;
                        const isDisabled = index > currentStep;

                        return (
                            <ConnectSdkDialogStep
                                key={title}
                                stepNumber={index + 1}
                                title={title}
                                isExpanded={expandedStep === index}
                                isCompleted={isCompleted}
                                isDisabled={isDisabled}
                                onExpand={() => setExpandedStep(index)}
                                summary={isCompleted && summary}
                            >
                                {content}
                            </ConnectSdkDialogStep>
                        );
                    })}
                    <StyledDialogFooter>
                        <Button
                            variant='contained'
                            disabled={!complete}
                            onClick={
                                complete ? () => onFinish(sdk.name) : undefined
                            }
                        >
                            Finish setup
                        </Button>
                    </StyledDialogFooter>
                </StyledDialogContent>
                <StyledDialogAside>
                    <NewConnectSdkDialogAside />
                </StyledDialogAside>
            </StyledDialogBody>
        </StyledDialog>
    );
};

interface IConnectSDKDialogProps {
    open: boolean;
    onClose: () => void;
    onFinish: (sdkName: string) => void;
    project: string;
    environments: string[];
    feature?: string;
}

export const ConnectSdkDialog = ({
    open,
    ...props
}: IConnectSDKDialogProps) => {
    if (!open) return null;
    return <InnerDialog {...props} />;
};
