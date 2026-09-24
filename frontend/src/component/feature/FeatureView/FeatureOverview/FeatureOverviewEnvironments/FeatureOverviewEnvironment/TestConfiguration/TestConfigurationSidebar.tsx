import { type FormEventHandler, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, styled } from '@mui/material';
import { DynamicSidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useToast from 'hooks/useToast';
import { useEventTracker } from 'hooks/useEventTracker';
import { formatUnknownError } from 'utils/formatUnknownError';
import { BadRequestError } from 'utils/apiUtils';
import { usePlaygroundApi } from 'hooks/api/actions/usePlayground/usePlayground';
import { PlaygroundCodeFieldset } from 'component/playground/Playground/PlaygroundForm/PlaygroundCodeFieldset/PlaygroundCodeFieldset.tsx';
import { FeatureDetailsBody } from 'component/playground/Playground/PlaygroundResultsTable/FeatureResultInfoPopoverCell/FeatureDetails/FeatureDetails.tsx';
import { PlaygroundResultFeatureStrategyList } from 'component/playground/Playground/PlaygroundResultsTable/FeatureResultInfoPopoverCell/FeatureStrategyList/PlaygroundResultsFeatureStrategyList.tsx';
import { PlaygroundResultChip } from 'component/playground/Playground/PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip.tsx';
import type {
    AdvancedPlaygroundEnvironmentFeatureSchema,
    AdvancedPlaygroundResponseSchema,
} from 'openapi';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { buildContextSeed } from './buildContextSeed.ts';

interface ITestConfigurationSidebarProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    featureId: string;
    environmentId: string;
    strategies?: IFeatureStrategy[];
}

const StyledContent = styled('div')(({ theme }) => ({
    width: 762,
    maxWidth: '100%',
    padding: theme.spacing(6, 4, 4),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledTitle = styled('h2')(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    margin: 0,
}));

const StyledDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    margin: 0,
}));

const StyledHelpText = styled('p')(({ theme }) => ({
    color: theme.palette.text.primary,
    margin: 0,
}));

const StyledSectionLabel = styled('p')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    margin: 0,
}));

const StyledSectionRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const StyledResultSection = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
}));

const StyledButtonRow = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

const StyledPlaygroundResultFeatureStrategyList = styled(
    PlaygroundResultFeatureStrategyList,
)(({ theme }) => ({
    borderTopWidth: 0,
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
}));

const getContextFields = (
    evaluations: AdvancedPlaygroundEnvironmentFeatureSchema[],
): string[] => {
    const fields = new Set(
        evaluations.flatMap((evaluation) => Object.keys(evaluation.context)),
    );

    return Array.from(fields).filter(
        (field) =>
            new Set(evaluations.map((evaluation) => evaluation.context[field]))
                .size > 1,
    );
};

const EvaluationResult = ({
    evaluation,
    environmentId,
    label,
}: {
    evaluation: AdvancedPlaygroundEnvironmentFeatureSchema;
    environmentId: string;
    label: string;
}) => {
    const input = { environment: environmentId, context: evaluation.context };

    return (
        <StyledResultSection>
            <StyledSectionRow>
                <StyledSectionLabel>{label}</StyledSectionLabel>
                {evaluation.strategies?.result !== 'unknown' ? (
                    <PlaygroundResultChip
                        enabled={evaluation.isEnabled}
                        label={evaluation.isEnabled ? 'True' : 'False'}
                    />
                ) : (
                    <PlaygroundResultChip
                        enabled='unknown'
                        label='Unknown'
                        showIcon={false}
                    />
                )}
            </StyledSectionRow>
            <FeatureDetailsBody feature={evaluation} input={input} />
            <StyledPlaygroundResultFeatureStrategyList
                feature={evaluation}
                input={input}
            />
        </StyledResultSection>
    );
};

export const TestConfigurationSidebar = ({
    open,
    onClose,
    projectId,
    featureId,
    environmentId,
    strategies,
}: ITestConfigurationSidebarProps) => {
    const { setToastData } = useToast();
    const { trackEvent } = useEventTracker();
    const { evaluateAdvancedPlayground, loading } = usePlaygroundApi();

    const [context, setContext] = useState<string | undefined>('{}');
    const [configurationError, setConfigurationError] = useState<string>();
    const [result, setResult] = useState<AdvancedPlaygroundResponseSchema>();

    const strategiesRef = useRef(strategies);
    strategiesRef.current = strategies;

    useEffect(() => {
        if (open) {
            setContext(buildContextSeed(strategiesRef.current));
            setConfigurationError(undefined);
            setResult(undefined);
        }
    }, [open]);

    const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();

        trackEvent('playground', {
            props: {
                eventType: 'test-configuration-in-context',
                environment: environmentId,
            },
        });

        try {
            setConfigurationError(undefined);
            const parsedContext = {
                appName: 'playground',
                ...JSON.parse(context || '{}'),
            };
            const response = await evaluateAdvancedPlayground({
                projects: [projectId],
                environments: [environmentId],
                context: parsedContext,
            });
            setResult(response);
        } catch (error: unknown) {
            if (error instanceof BadRequestError) {
                setConfigurationError(error.message);
            } else if (error instanceof SyntaxError) {
                setToastData({
                    type: 'error',
                    text: `Error parsing context: ${formatUnknownError(error)}`,
                });
            } else {
                setToastData({
                    type: 'error',
                    text: formatUnknownError(error),
                });
            }
        }
    };

    // Comma-separated context values are evaluated as one context per value
    const evaluations =
        result?.features?.find((feature) => feature.name === featureId)
            ?.environments?.[environmentId] ?? [];
    const contextFields = getContextFields(evaluations);

    const invalidContextProperties = result?.warnings?.invalidContextProperties;

    return (
        <DynamicSidebarModal
            open={open}
            onClose={onClose}
            label='Try configuration'
        >
            <StyledContent>
                <StyledTitle>Try configuration</StyledTitle>
                <StyledDescription>
                    Test your strategy configuration. This may help you to
                    understand how Unleash works, how feature flags are
                    evaluated and for you to easily debug your feature flags.
                </StyledDescription>
                <StyledHelpText>
                    You can edit within the field below to test different
                    contexts
                </StyledHelpText>
                <Box component='form' onSubmit={onSubmit}>
                    <PlaygroundCodeFieldset
                        context={context}
                        setContext={setContext}
                    />
                    <StyledButtonRow>
                        <Button
                            variant='contained'
                            type='submit'
                            disabled={loading}
                        >
                            Try configuration
                        </Button>
                    </StyledButtonRow>
                </Box>
                {configurationError ? (
                    <Alert severity='warning'>{configurationError}</Alert>
                ) : null}
                {invalidContextProperties &&
                invalidContextProperties.length > 0 ? (
                    <Alert severity='warning'>
                        Some context properties were not taken into account
                        during evaluation:{' '}
                        {invalidContextProperties?.join(', ')}
                    </Alert>
                ) : null}
                {evaluations.map((evaluation) => {
                    const contextLabel = contextFields
                        .map(
                            (field) =>
                                `${field}: ${String(evaluation.context[field] ?? '')}`,
                        )
                        .join(', ');

                    return (
                        <EvaluationResult
                            key={contextLabel}
                            evaluation={evaluation}
                            environmentId={environmentId}
                            label={
                                contextLabel
                                    ? `Result for ${contextLabel}`
                                    : 'Result'
                            }
                        />
                    );
                })}
                <StyledButtonRow>
                    <Button variant='outlined' onClick={onClose}>
                        Close
                    </Button>
                </StyledButtonRow>
            </StyledContent>
        </DynamicSidebarModal>
    );
};
