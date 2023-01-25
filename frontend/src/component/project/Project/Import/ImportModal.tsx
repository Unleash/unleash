import { styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import React, { useEffect, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ImportTimeline } from './ImportTimeline';
import { ImportStage } from './ImportStage';
import {
    Actions,
    ConfigurationStage,
    ConfigurationTabs,
    ImportArea,
    ImportMode,
} from './configure/ConfigurationStage';
import { ValidationStage } from './validate/ValidationStage';
import { ImportOptions } from './configure/ImportOptions';

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
    const [importStage, setImportStage] = useState<ImportStage>('configure');
    const [environment, setEnvironment] = useState('');
    const [importPayload, setImportPayload] = useState('');
    const [activeTab, setActiveTab] = useState<ImportMode>('file');

    useEffect(() => {
        console.log('env', environment);
    }, [environment]);

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
                                    onClose={() => setOpen(false)}
                                />
                            }
                        />
                    }
                />
                {importStage === 'validate' ? (
                    <ValidationStage
                        project={project}
                        environment={environment}
                        payload={JSON.parse(importPayload)}
                        onBack={() => setImportStage('configure')}
                        onClose={() => setOpen(false)}
                    />
                ) : (
                    ''
                )}
            </ModalContentContainer>
        </SidebarModal>
    );
};
