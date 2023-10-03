import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { KeyboardArrowDownOutlined } from '@mui/icons-material';
import React, { FC, useEffect } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { IMPORT_ENVIRONMENT } from 'utils/testIds';
import useProject from 'hooks/api/getters/useProject/useProject';

const ImportOptionsContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(3),
}));

const ImportOptionsHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    fontWeight: theme.fontWeight.bold,
}));

const ImportOptionsDescription = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1.5),
}));

interface IImportOptionsProps {
    project: string;
    environment: string;
    onChange: (value: string) => void;
}

export const ImportOptions: FC<IImportOptionsProps> = ({
    project,
    environment,
    onChange,
}) => {
    const { project: projectInfo } = useProject(project);
    const environmentOptions = projectInfo.environments.map(
        ({ environment }) => ({
            key: environment,
            label: environment,
            title: environment,
        })
    );

    useEffect(() => {
        if (environment === '' && environmentOptions[0]) {
            onChange(environmentOptions[0].key);
        }
    }, [JSON.stringify(environmentOptions)]);

    return (
        <ImportOptionsContainer>
            <ImportOptionsHeader>Import options</ImportOptionsHeader>
            <ImportOptionsDescription>
                Choose the environment to import the configuration for
            </ImportOptionsDescription>
            <GeneralSelect
                sx={{ width: '180px' }}
                options={environmentOptions}
                onChange={onChange}
                label={'Environment'}
                value={environment}
                data-testid={IMPORT_ENVIRONMENT}
                IconComponent={KeyboardArrowDownOutlined}
                fullWidth
            />
        </ImportOptionsContainer>
    );
};
