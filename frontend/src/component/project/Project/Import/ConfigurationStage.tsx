import {
    Box,
    Button,
    styled,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { ImportOptions } from './ImportOptions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StyledFileDropZone } from './StyledFileDropZone';
import { PulsingAvatar } from './PulsingAvatar';
import { ArrowUpward } from '@mui/icons-material';
import { ImportExplanation } from './ImportExplanation';
import React, { FC, useState } from 'react';
import useToast from 'hooks/useToast';
import { ImportLayoutContainer } from './ImportLayoutContainer';

const StyledTextField = styled(TextField)(({ theme }) => ({
    width: '100%',
}));

const DropMessage = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(4),
    fontSize: theme.fontSizes.mainHeader,
}));

const SelectFileMessage = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
    color: theme.palette.text.secondary,
}));

const MaxSizeMessage = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(4),
    color: theme.palette.text.secondary,
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    borderTop: `1px solid ${theme.palette.dividerAlternative}`,
    marginTop: 'auto',
    paddingTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'flex-end',
}));

type ImportMode = 'file' | 'code';

const isValidJSON = (json: string) => {
    try {
        JSON.parse(json);
        return true;
    } catch (e) {
        return false;
    }
};

interface IConfigurationSettings {
    environment: string;
    payload: string;
}

export const ConfigurationStage: FC<{
    project: string;
    onClose: () => void;
    onSubmit: (props: IConfigurationSettings) => void;
}> = ({ project, onClose, onSubmit }) => {
    const [environment, setEnvironment] = useState('');
    const [importPayload, setImportPayload] = useState('');
    const [activeTab, setActiveTab] = useState<ImportMode>('file');
    const [dragActive, setDragActive] = useState(false);
    const { setToastData } = useToast();

    return (
        <ImportLayoutContainer>
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Tabs value={activeTab}>
                    <Tab
                        label="Upload file"
                        value="file"
                        onClick={() => setActiveTab('file')}
                    />
                    <Tab
                        label="Code editor"
                        value="code"
                        onClick={() => setActiveTab('code')}
                    />
                </Tabs>
            </Box>
            <ImportOptions
                project={project}
                environment={environment}
                onChange={setEnvironment}
            />
            <ConditionallyRender
                condition={activeTab === 'file'}
                show={
                    <StyledFileDropZone
                        onSuccess={data => {
                            setImportPayload(data);
                            setActiveTab('code');
                            setToastData({
                                type: 'success',
                                title: 'File uploaded',
                            });
                        }}
                        onError={error => {
                            setImportPayload('');
                            setToastData({
                                type: 'error',
                                title: error,
                            });
                        }}
                        onDragStatusChange={setDragActive}
                    >
                        <PulsingAvatar active={dragActive}>
                            <ArrowUpward fontSize="large" />
                        </PulsingAvatar>
                        <DropMessage>
                            {dragActive
                                ? 'Drop your file to upload'
                                : 'Drop your file here'}
                        </DropMessage>
                        <SelectFileMessage>
                            or select a file from your device
                        </SelectFileMessage>
                        <Button variant="outlined">Select file</Button>
                        <MaxSizeMessage>JSON format: max 500 kB</MaxSizeMessage>
                    </StyledFileDropZone>
                }
                elseShow={
                    <StyledTextField
                        label="Exported toggles"
                        variant="outlined"
                        onChange={event => setImportPayload(event.target.value)}
                        value={importPayload}
                        multiline
                        minRows={13}
                        maxRows={13}
                    />
                }
            />
            <ImportExplanation />
            <ActionsContainer>
                <Button
                    sx={{ position: 'static' }}
                    variant="contained"
                    type="submit"
                    onClick={() =>
                        onSubmit({ payload: importPayload, environment })
                    }
                    disabled={!isValidJSON(importPayload)}
                >
                    Validate
                </Button>
                <Button
                    sx={{ position: 'static', ml: 2 }}
                    variant="outlined"
                    type="submit"
                    onClick={onClose}
                >
                    Cancel import
                </Button>
            </ActionsContainer>
        </ImportLayoutContainer>
    );
};
