import { Button, styled, TextField } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { KeyboardArrowDownOutlined } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useImportApi } from 'hooks/api/actions/useImportApi/useImportApi';
import { useProjectEnvironments } from 'hooks/api/getters/useProjectEnvironments/useProjectEnvironments';
import { StyledFileDropZone } from './ImportTogglesDropZone';

const StyledDiv = styled('div')(({ theme }) => ({
    backgroundColor: '#efefef',
    height: '100vh',
    padding: theme.spacing(2),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    width: '100%',
    margin: theme.spacing(2, 0),
}));

interface IImportModalProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;

    project: string;
}

export const ImportModal = ({ open, setOpen, project }: IImportModalProps) => {
    const { environments } = useProjectEnvironments(project);
    const { createImport } = useImportApi();

    const environmentOptions = environments
        .filter(environment => environment.enabled)
        .map(environment => ({
            key: environment.name,
            label: environment.name,
            title: environment.name,
        }));

    const [environment, setEnvironment] = useState('');
    const [data, setData] = useState('');

    useEffect(() => {
        setEnvironment(environmentOptions[0]?.key);
    }, [JSON.stringify(environmentOptions)]);

    const onSubmit = async () => {
        await createImport({
            data: JSON.parse(data),
            environment,
            project,
        });
    };

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label={'New service account'}
        >
            <StyledDiv>
                <GeneralSelect
                    sx={{ width: '140px' }}
                    options={environmentOptions}
                    onChange={setEnvironment}
                    label={'Environment'}
                    value={environment}
                    IconComponent={KeyboardArrowDownOutlined}
                    fullWidth
                />
                <StyledFileDropZone onChange={setData}>
                    <p>
                        Drag 'n' drop some files here, or click to select files
                    </p>
                </StyledFileDropZone>
                <StyledTextField
                    label="Exported toggles"
                    variant="outlined"
                    onChange={event => setData(event.target.value)}
                    value={data}
                    multiline
                    minRows={20}
                    maxRows={20}
                />
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    onClick={onSubmit}
                >
                    Import
                </Button>{' '}
            </StyledDiv>
        </SidebarModal>
    );
};
