import { FormEventHandler, useState, VFC } from 'react';
import {
    Box,
    Button,
    Divider,
    Paper,
    Typography,
    useTheme,
} from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { PlaygroundConnectionFieldset } from './PlaygroundConnectionFieldset/PlaygroundConnectionFieldset';
import { PlaygroundCodeFieldset } from './PlaygroundCodeFieldset/PlaygroundCodeFieldset';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IPlaygroundProps {}

export const Playground: VFC<IPlaygroundProps> = () => {
    const theme = useTheme();
    const [context, setContext] = useState<string>();
    const [contextObject, setContextObject] = useState<string>();
    const { setToastData } = useToast();

    const onSubmit: FormEventHandler<HTMLFormElement> = event => {
        event.preventDefault();

        try {
            setContextObject(
                JSON.stringify(JSON.parse(context || '{}'), null, 2)
            );
        } catch (error: unknown) {
            setToastData({
                type: 'error',
                title: `Error parsing context: ${formatUnknownError(error)}`,
            });
        }
    };

    return (
        <PageContent header={<PageHeader title="Unleash playground" />}>
            <Paper
                elevation={0}
                sx={{
                    px: 4,
                    py: 3,
                    background: theme.palette.grey[200],
                }}
            >
                <Box component="form" onSubmit={onSubmit}>
                    <Typography
                        sx={{
                            mb: 3,
                        }}
                    >
                        Configure playground
                    </Typography>
                    <PlaygroundConnectionFieldset />
                    <Divider
                        variant="fullWidth"
                        sx={{
                            mb: 2,
                            borderColor: theme.palette.dividerAlternative,
                            borderStyle: 'dashed',
                        }}
                    />
                    <PlaygroundCodeFieldset
                        value={context}
                        setValue={setContext}
                    />
                    <Divider
                        variant="fullWidth"
                        sx={{
                            mt: 3,
                            mb: 2,
                            borderColor: theme.palette.dividerAlternative,
                        }}
                    />
                    <Button variant="contained" size="large" type="submit">
                        Try configuration
                    </Button>
                </Box>
            </Paper>
            {Boolean(contextObject) && (
                <Box sx={{ p: 4 }}>
                    <Typography>TODO: Request</Typography>
                    <pre>{contextObject}</pre>
                </Box>
            )}
        </PageContent>
    );
};
