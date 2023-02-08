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
import {
    IMPORT_BUTTON,
    IMPORT_CONFIGURATION_BUTTON,
    VALIDATE_BUTTON,
} from '../../../../utils/testIds';

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
