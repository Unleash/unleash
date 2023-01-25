import {
    Box,
    Button,
    styled,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StyledFileDropZone } from './StyledFileDropZone';
import { PulsingAvatar } from './PulsingAvatar';
import { ArrowUpward } from '@mui/icons-material';
import { ImportExplanation } from './ImportExplanation';
import React, { FC, ReactNode, useState } from 'react';
import useToast from 'hooks/useToast';
import { ImportLayoutContainer } from '../ImportLayoutContainer';
import { ActionsContainer } from '../ActionsContainer';

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

export type ImportMode = 'file' | 'code';

export const ConfigurationTabs: FC<{
    activeTab: ImportMode;
    setActiveTab: (mode: ImportMode) => void;
}> = ({ activeTab, setActiveTab }) => (
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
);

export const ImportArea: FC<{
    activeTab: ImportMode;
    setActiveTab: (mode: ImportMode) => void;
    importPayload: string;
    setImportPayload: (payload: string) => void;
}> = ({ activeTab, setActiveTab, importPayload, setImportPayload }) => {
    const [dragActive, setDragActive] = useState(false);
    const { setToastData } = useToast();

    return (
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
    );
};

export const Actions: FC<{
    onSubmit: () => void;
    onClose: () => void;
    disabled: boolean;
}> = ({ onSubmit, onClose, disabled }) => (
    <ActionsContainer>
        <Button
            sx={{ position: 'static' }}
            variant="contained"
            type="submit"
            onClick={onSubmit}
            disabled={disabled}
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
);

export const ConfigurationStage: FC<{
    tabs: ReactNode;
    importOptions: ReactNode;
    importArea: ReactNode;
    actions: ReactNode;
}> = ({ tabs, importOptions, importArea, actions }) => {
    return (
        <ImportLayoutContainer>
            {tabs}
            {importOptions}
            {importArea}
            <ImportExplanation />
            {actions}
        </ImportLayoutContainer>
    );
};
