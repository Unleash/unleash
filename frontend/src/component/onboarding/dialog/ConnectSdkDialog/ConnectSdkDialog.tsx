import { Box, Button, styled } from '@mui/material';
import { ConnectSdkDialogAside } from './ConnectSdkDialogAside';
import { useState } from 'react';
import { ConnectSdkDialogStep } from './ConnectSdkDialogStep';
import type { Sdk } from '../sharedTypes';
import { SelectSdk } from './SelectSdk/SelectSdk';
import { SelectSdkSummary } from './SelectSdk/SelectSdkSummary';
import { GenerateApiKey } from './GenerateApiKey/GenerateApiKey';
import { GenerateApiKeySummary } from './GenerateApiKey/GenerateApiKeySummary';
import { ConfigureSdk } from './ConfigureSdk';
import { DialogWithAside } from 'component/common/DialogWithAside/DialogWithAside';
import { useEventTracker } from 'hooks/useEventTracker';

const StyledDialogFooter = styled(Box)({
    display: 'flex',
    justifyContent: 'flex-end',
});

const StyledContent = styled('div')(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledAsideContent = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
}));

type Step = {
    title: string;
    content: React.ReactNode;
    summary?: React.ReactNode;
};

interface IConnectSDKDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    environments: string[];
    feature?: string;
}

export const ConnectSdkDialog = ({
    open,
    onClose,
    projectId,
    environments,
    feature,
}: IConnectSDKDialogProps) => {
    const { trackEvent } = useEventTracker();

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
        if (!apiKey && sdk) {
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

    const handleStepExpand = (stepIndex: number) => {
        const nextStep = stepIndex + 1;
        if (
            expandedStep === stepIndex &&
            nextStep < steps.length &&
            nextStep <= currentStep
        ) {
            setExpandedStep(nextStep);
        } else if (expandedStep !== stepIndex) {
            setExpandedStep(stepIndex);
        }
    };

    const onFinishClick = () => {
        if (complete) {
            trackEvent('onboarding', {
                props: {
                    eventType: 'onboarding-finished',
                    onboardedSdk: sdk.name,
                },
            });
            onClose();
        }
    };

    if (!open) return null;

    return (
        <DialogWithAside
            open
            onClose={onClose}
            title='Connect SDK'
            fullHeight
            aside={
                <StyledAsideContent>
                    <ConnectSdkDialogAside />
                </StyledAsideContent>
            }
        >
            <StyledContent>
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
                            onExpand={() => handleStepExpand(index)}
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
                        onClick={onFinishClick}
                    >
                        Finish setup
                    </Button>
                </StyledDialogFooter>
            </StyledContent>
        </DialogWithAside>
    );
};
