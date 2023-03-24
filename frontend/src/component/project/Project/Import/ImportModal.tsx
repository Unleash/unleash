import { styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import React, { useEffect, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ImportTimeline } from './ImportTimeline';
import { StageName } from './StageName';
import {
    Actions,
    ConfigurationStage,
    ConfigurationTabs,
    ImportArea,
    ImportMode,
} from './configure/ConfigurationStage';
import { ValidationStage } from './validate/ValidationStage';
import { ImportStage } from './import/ImportStage';
import { ImportOptions } from './configure/ImportOptions';

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
    } catch (e) {
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

    const close = () => {
        setOpen(false);
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
        <SidebarModal open={open} onClose={close} label="Import toggles">
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
                                    onClose={close}
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
                            onClose={close}
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
