import { Box, Button, styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import React, { useState } from 'react';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import { ImportTimeline } from './ImportTimeline';
import { ImportStage } from './ImportStage';
import { ConfigurationStage } from './ConfigurationStage';
import { ValidationStage } from './ValidationState';
import { useImportApi } from '../../../../hooks/api/actions/useImportApi/useImportApi';

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

interface IImportModalProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    project: string;
}

export const ImportModal = ({ open, setOpen, project }: IImportModalProps) => {
    const [importStage, setImportStage] = useState<ImportStage>({
        name: 'configure',
    });

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
                    <ImportTimeline stage={importStage.name} />
                </TimelineContainer>
                <ConditionallyRender
                    condition={importStage.name === 'configure'}
                    show={
                        <ConfigurationStage
                            project={project}
                            onClose={() => setOpen(false)}
                            onSubmit={configuration =>
                                setImportStage({
                                    name: 'validate',
                                    ...configuration,
                                })
                            }
                        />
                    }
                />
                {importStage.name === 'validate' ? (
                    <ValidationStage
                        project={project}
                        environment={importStage.environment}
                    />
                ) : (
                    ''
                )}
            </ModalContentContainer>
        </SidebarModal>
    );
};
