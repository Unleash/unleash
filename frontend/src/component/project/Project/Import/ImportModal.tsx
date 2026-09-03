import { styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { useDialogTracking } from 'hooks/useDialogTracking';
import { useEffect, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ImportTimeline } from './ImportTimeline.tsx';
import type { StageName } from './StageName.tsx';
import {
    Actions,
    ConfigurationStage,
    ConfigurationTabs,
    ImportArea,
    type ImportMode,
} from './configure/ConfigurationStage.tsx';
import { ValidationStage } from './validate/ValidationStage.tsx';
import { ImportStage } from './import/ImportStage.tsx';
import { ImportOptions } from './configure/ImportOptions.tsx';
import { importCompletedTracking } from 'component/project/Project/Import/importTracking';

const ModalContentContainer = styled('div')(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
}));

const TimelineContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.sidebar,
    padding: theme.spacing(8),
    flexBasis: '30%',
}));

const TimelineHeader = styled('div')(({ theme }) => ({
    textTransform: 'uppercase',
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.common.white,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(3),
}));

const isValidJSON = (json: string) => {
    try {
        JSON.parse(json);
        return true;
    } catch (_e) {
        return false;
    }
};

interface IImportModalProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    project: string;
}

export const ImportModal = ({ open, setOpen, project }: IImportModalProps) => {
    const [importStage, setImportStage] = useState<StageName>('configure');
    const [environment, setEnvironment] = useState('');
    const [importPayload, setImportPayload] = useState('');
    const [activeTab, setActiveTab] = useState<ImportMode>('file');

    const emitDismissed = useDialogTracking(open, importCompletedTracking);

    const close = () => {
        setOpen(false);
    };

    const cancel = () => {
        emitDismissed('cancel-button');
        close();
    };

    useEffect(() => {
        if (open === true) {
            setInitialState();
        }
    }, [open]);

    const setInitialState = () => {
        setImportStage('configure');
        setEnvironment('');
        setImportPayload('');
        setActiveTab('file');
    };

    return (
        <SidebarModal
            open={open}
            onClose={close}
            label='Import flags'
            tracking={importCompletedTracking}
        >
            <ModalContentContainer>
                <TimelineContainer>
                    <TimelineHeader>Process</TimelineHeader>
                    <ImportTimeline stage={importStage} />
                </TimelineContainer>
                <ConditionallyRender
                    condition={importStage === 'configure'}
                    show={
                        <ConfigurationStage
                            tabs={
                                <ConfigurationTabs
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                />
                            }
                            importOptions={
                                <ImportOptions
                                    project={project}
                                    environment={environment}
                                    onChange={setEnvironment}
                                />
                            }
                            importArea={
                                <ImportArea
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    importPayload={importPayload}
                                    setImportPayload={setImportPayload}
                                />
                            }
                            actions={
                                <Actions
                                    disabled={!isValidJSON(importPayload)}
                                    onSubmit={() => setImportStage('validate')}
                                    onClose={cancel}
                                />
                            }
                        />
                    }
                />
                <ConditionallyRender
                    condition={importStage === 'validate'}
                    show={
                        <ValidationStage
                            project={project}
                            environment={environment}
                            payload={importPayload}
                            onBack={() => setImportStage('configure')}
                            onSubmit={() => setImportStage('import')}
                            onClose={cancel}
                        />
                    }
                />
                <ConditionallyRender
                    condition={importStage === 'import'}
                    show={
                        <ImportStage
                            project={project}
                            environment={environment}
                            payload={importPayload}
                            onClose={close}
                        />
                    }
                />
            </ModalContentContainer>
        </SidebarModal>
    );
};
