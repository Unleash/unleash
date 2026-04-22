import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    useReleaseAgentApi,
    type CompiledPreview,
} from 'hooks/api/actions/useReleaseAgentApi/useReleaseAgentApi';
import { SequencePreview } from './SequencePreview.tsx';

type Props = {
    project: string;
    environment: string;
    features: string[];
    onCommitted: (sequenceId: string) => void;
};

export const ChatPanel = ({
    project,
    environment,
    features,
    onCommitted,
}: Props) => {
    const { compileSequence, commitSequence } = useReleaseAgentApi();
    const [prompt, setPrompt] = useState('');
    const [preview, setPreview] = useState<CompiledPreview | undefined>();
    const [status, setStatus] = useState<'idle' | 'compiling' | 'committing'>(
        'idle',
    );
    const [error, setError] = useState<string | undefined>();

    const compileDisabled =
        status !== 'idle' ||
        features.length === 0 ||
        prompt.trim().length === 0;

    const compile = async () => {
        setError(undefined);
        setStatus('compiling');
        try {
            const result = await compileSequence({
                project,
                environment,
                prompt,
                features,
            });
            setPreview(result);
        } catch (err: any) {
            setError(
                err?.message ??
                    'Compile failed. Check the backend logs for details.',
            );
            setPreview(undefined);
        } finally {
            setStatus('idle');
        }
    };

    const commit = async () => {
        if (!preview) return;
        setError(undefined);
        setStatus('committing');
        try {
            const created = await commitSequence({
                project: preview.project,
                environment: preview.environment,
                prompt: preview.prompt,
                model: preview.model,
                agentVersion: preview.agentVersion,
                actions: preview.actions,
                safeguards: preview.safeguards,
            });
            onCommitted(created.id);
        } catch (err: any) {
            setError(
                err?.message ??
                    'Commit failed. Check the backend logs for details.',
            );
        } finally {
            setStatus('idle');
        }
    };

    const discard = () => {
        setPreview(undefined);
    };

    return (
        <Paper variant='outlined' sx={{ p: 2 }}>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
                Describe the rollout
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                {features.length === 0
                    ? 'Select one or more features above, then describe how you want to roll them out.'
                    : `Target: ${features.join(', ')}. Describe the cadence and any guardrails.`}
            </Typography>
            <TextField
                fullWidth
                multiline
                minRows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g. canary to 10/50/100% over five minutes and pause on error spike'
                disabled={status !== 'idle'}
            />
            <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
                <Button
                    variant='contained'
                    onClick={compile}
                    disabled={compileDisabled}
                    startIcon={
                        status === 'compiling' ? (
                            <CircularProgress size={14} />
                        ) : undefined
                    }
                >
                    {status === 'compiling' ? 'Compiling…' : 'Compile preview'}
                </Button>
                {preview ? (
                    <>
                        <Button
                            color='primary'
                            variant='outlined'
                            onClick={commit}
                            disabled={status !== 'idle'}
                            startIcon={
                                status === 'committing' ? (
                                    <CircularProgress size={14} />
                                ) : undefined
                            }
                        >
                            {status === 'committing'
                                ? 'Committing…'
                                : 'Commit sequence'}
                        </Button>
                        <Button
                            variant='text'
                            onClick={discard}
                            disabled={status !== 'idle'}
                        >
                            Discard
                        </Button>
                    </>
                ) : null}
            </Stack>

            {error ? (
                <Alert severity='error' sx={{ mt: 2 }}>
                    {error}
                </Alert>
            ) : null}

            {preview ? (
                <Box sx={{ mt: 2 }}>
                    <SequencePreview preview={preview} />
                </Box>
            ) : null}
        </Paper>
    );
};
