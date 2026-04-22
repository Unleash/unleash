import { useState } from 'react';
import { Button, Stack, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { usePageTitle } from 'hooks/usePageTitle';
import { FeaturePicker } from './FeaturePicker.tsx';
import { ChatPanel } from './ChatPanel.tsx';

export const ReleaseAgentAuthorPage = () => {
    usePageTitle('Release Agent');
    const navigate = useNavigate();

    const [project, setProject] = useState('default');
    const [environment, setEnvironment] = useState('development');
    const [features, setFeatures] = useState<string[]>([]);

    const onCommitted = (sequenceId: string) => {
        navigate(
            `/release-agent/sequences?project=${encodeURIComponent(project)}&environment=${encodeURIComponent(environment)}&sequence=${encodeURIComponent(sequenceId)}`,
        );
    };

    return (
        <PageContent
            header={
                <PageHeader
                    title='Release Agent'
                    actions={
                        <Button
                            variant='outlined'
                            size='small'
                            onClick={() => navigate('/release-agent/sequences')}
                        >
                            View sequences
                        </Button>
                    }
                />
            }
        >
            <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
                <TextField
                    size='small'
                    label='Project'
                    value={project}
                    onChange={(e) => {
                        setProject(e.target.value);
                        setFeatures([]);
                    }}
                />
                <TextField
                    size='small'
                    label='Environment'
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                />
            </Stack>

            <Stack spacing={2}>
                <FeaturePicker
                    project={project}
                    value={features}
                    onChange={setFeatures}
                />
                <ChatPanel
                    project={project}
                    environment={environment}
                    features={features}
                    onCommitted={onCommitted}
                />
            </Stack>
        </PageContent>
    );
};
