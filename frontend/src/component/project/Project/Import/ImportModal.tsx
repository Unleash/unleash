import {
    Button,
    styled,
    Tabs,
    Tab,
    TextField,
    Box,
    Typography,
} from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { ArrowUpward } from '@mui/icons-material';
import React, { useState } from 'react';
import { useImportApi } from 'hooks/api/actions/useImportApi/useImportApi';
import { StyledFileDropZone } from './StyledFileDropZone';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import useToast from 'hooks/useToast';
import { ImportOptions } from './ImportOptions';
import { ImportExplanation } from './ImportExplanation';
import { PulsingAvatar } from './PulsingAvatar';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { ImportTimeline } from './ImportTimeline';

const ModalContentContainer = styled('div')(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
}));

const TimelineContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(6, 8, 3, 4),
    flexBasis: '30%',
}));

const TimelineHeader = styled('div')(({ theme }) => ({
    textTransform: 'uppercase',
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.tertiaryContrast,
    fontWeight: theme.typography.fontWeightBold,
    paddingLeft: theme.spacing(2),
    marginBottom: theme.spacing(4),
}));

const ImportLayoutContainer = styled('div')(({ theme }) => ({
    backgroundColor: '#fff',
    padding: theme.spacing(3, 8, 3, 8),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    flexBasis: '70%',
}));

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

interface IImportModalProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;

    project: string;
}

type ImportMode = 'file' | 'code';

export const ImportModal = ({ open, setOpen, project }: IImportModalProps) => {
    const { createImport } = useImportApi();

    const [environment, setEnvironment] = useState('');
    const [importPayload, setImportPayload] = useState('');
    const [activeTab, setActiveTab] = useState<ImportMode>('file');
    const [dragActive, setDragActive] = useState(false);

    const onSubmit = async () => {
        await createImport({
            data: JSON.parse(importPayload),
            environment,
            project,
        });
    };

    const { setToastData } = useToast();

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label="Import toggles"
        >
            <ModalContentContainer>
                <TimelineContainer>
                    <TimelineHeader>Process</TimelineHeader>
                    <ImportTimeline stage={'configure'} />
                </TimelineContainer>
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
                                <MaxSizeMessage>
                                    JSON format: max 500 kB
                                </MaxSizeMessage>
                            </StyledFileDropZone>
                        }
                        elseShow={
                            <StyledTextField
                                label="Exported toggles"
                                variant="outlined"
                                onChange={event =>
                                    setImportPayload(event.target.value)
                                }
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
                            color="primary"
                            type="submit"
                            onClick={onSubmit}
                        >
                            Import
                        </Button>
                    </ActionsContainer>
                </ImportLayoutContainer>
            </ModalContentContainer>
        </SidebarModal>
    );
};
