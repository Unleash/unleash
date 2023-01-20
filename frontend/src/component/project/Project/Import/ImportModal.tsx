import {
    Button,
    styled,
    Tabs,
    Tab,
    TextField,
    Box,
    Typography,
    Avatar,
} from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { ArrowUpward } from '@mui/icons-material';
import React, { useState } from 'react';
import { useImportApi } from 'hooks/api/actions/useImportApi/useImportApi';
import { StyledFileDropZone } from './StyledFileDropZone';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import useToast from 'hooks/useToast';
import { ImportOptions } from './ImportOptions';

const LayoutContainer = styled('div')(({ theme }) => ({
    backgroundColor: '#fff',
    height: '100vh',
    padding: theme.spacing(4, 8, 4, 8),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
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
    marginTop: theme.spacing(9),
    color: theme.palette.text.secondary,
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    borderTop: `1px solid ${theme.palette.dividerAlternative}`,
    marginTop: 'auto',
    paddingTop: theme.spacing(4),
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
            <LayoutContainer>
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
                        >
                            <Avatar sx={{ width: 80, height: 80 }}>
                                <ArrowUpward fontSize="large" />
                            </Avatar>
                            <DropMessage>Drop your file here</DropMessage>
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
                            minRows={17}
                            maxRows={17}
                        />
                    }
                />
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
            </LayoutContainer>
        </SidebarModal>
    );
};
