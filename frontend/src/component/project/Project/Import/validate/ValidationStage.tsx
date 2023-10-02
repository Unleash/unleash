import { ImportLayoutContainer } from '../ImportLayoutContainer';
import { Box, Button, styled, Typography } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import {
    IValidationSchema,
    useValidateImportApi,
} from 'hooks/api/actions/useValidateImportApi/useValidateImportApi';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ActionsContainer } from '../ActionsContainer';
import { IMPORT_CONFIGURATION_BUTTON } from 'utils/testIds';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const ImportInfoContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(3),
}));

const Label = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));
const Value = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.primary,
    fontWeight: theme.fontWeight.bold,
}));

const ErrorContainer = styled(Box)(({ theme }) => ({
    border: `1px solid ${theme.palette.error.border}`,
    borderRadius: theme.shape.borderRadiusLarge,
    paddingBottom: theme.spacing(2),
}));

const WarningContainer = styled(Box)(({ theme }) => ({
    border: `1px solid ${theme.palette.warning.border}`,
    borderRadius: theme.shape.borderRadiusLarge,
    paddingBottom: theme.spacing(2),
}));

const ErrorHeader = styled(Box)(({ theme }) => ({
    color: theme.palette.error.dark,
    backgroundColor: theme.palette.error.light,
    fontSize: theme.fontSizes.smallBody,
    borderBottom: `1px solid ${theme.palette.error.border}`,
    borderTopLeftRadius: theme.shape.borderRadiusLarge,
    borderTopRightRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2),
}));

const WarningHeader = styled(Box)(({ theme }) => ({
    color: theme.palette.warning.dark,
    backgroundColor: theme.palette.warning.light,
    fontSize: theme.fontSizes.smallBody,
    borderBottom: `1px solid ${theme.palette.warning.border}`,
    borderTopLeftRadius: theme.shape.borderRadiusLarge,
    borderTopRightRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2),
}));

const ErrorMessage = styled(Box)(({ theme }) => ({
    color: theme.palette.error.dark,
    fontSize: theme.fontSizes.smallBody,
}));

const WarningMessage = styled(Box)(({ theme }) => ({
    color: theme.palette.warning.dark,
    fontSize: theme.fontSizes.smallBody,
}));

const StyledItems = styled('ul')(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0),
    paddingLeft: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    borderBottom: `1px dashed ${theme.palette.neutral.border}`,
}));

const StyledItem = styled('li')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

export const ValidationStage: FC<{
    environment: string;
    project: string;
    payload: string;
    onClose: () => void;
    onSubmit: () => void;
    onBack: () => void;
}> = ({ environment, project, payload, onClose, onBack, onSubmit }) => {
    const { validateImport } = useValidateImportApi();
    const { setToastData } = useToast();
    const { trackEvent } = usePlausibleTracker();
    const [validationResult, setValidationResult] = useState<IValidationSchema>(
        { errors: [], warnings: [], permissions: [] }
    );
    const [validJSON, setValidJSON] = useState(true);

    const trackValidation = (result: IValidationSchema) => {
        if (result.errors.length > 0 || result.permissions.length > 0) {
            trackEvent('export_import', {
                props: {
                    eventType: `validation fail`,
                },
            });
        } else {
            trackEvent('export_import', {
                props: {
                    eventType: `validation success`,
                },
            });
        }
        setValidationResult(result);
    };

    useEffect(() => {
        validateImport({ environment, project, data: JSON.parse(payload) })
            .then(trackValidation)
            .catch(error => {
                setValidJSON(false);
                setToastData({
                    type: 'error',
                    title: formatUnknownError(error),
                });
            });
    }, []);

    return (
        <ImportLayoutContainer>
            <ImportInfoContainer>
                <Typography sx={{ mb: 1.5 }}>
                    You are importing this configuration in:
                </Typography>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <span>
                        <Label>Environment: </Label>
                        <Value>{environment}</Value>
                    </span>
                    <span>
                        <Label>Project: </Label>
                        <Value>{project}</Value>
                    </span>
                </Box>
            </ImportInfoContainer>
            <ConditionallyRender
                condition={validationResult.permissions.length > 0}
                show={
                    <ErrorContainer>
                        <ErrorHeader>
                            <strong>Missing permissions!</strong> There are some
                            permissions that you need to be granted before
                            importing this configuration
                        </ErrorHeader>
                        {validationResult.permissions.map(error => (
                            <Box key={error.message} sx={{ p: 2 }}>
                                <ErrorMessage>{error.message}</ErrorMessage>
                                <StyledItems>
                                    {error.affectedItems.map(item => (
                                        <StyledItem key={item}>
                                            {item}
                                        </StyledItem>
                                    ))}
                                </StyledItems>
                            </Box>
                        ))}
                    </ErrorContainer>
                }
            />
            <ConditionallyRender
                condition={validationResult.errors.length > 0}
                show={
                    <ErrorContainer>
                        <ErrorHeader>
                            <strong>Conflict!</strong> There are some errors
                            that need to be fixed before the import.
                        </ErrorHeader>
                        {validationResult.errors.map(error => (
                            <Box key={error.message} sx={{ p: 2 }}>
                                <ErrorMessage>{error.message}</ErrorMessage>
                                <StyledItems>
                                    {error.affectedItems.map(item => (
                                        <StyledItem key={item}>
                                            {item}
                                        </StyledItem>
                                    ))}
                                </StyledItems>
                            </Box>
                        ))}
                    </ErrorContainer>
                }
            />
            <ConditionallyRender
                condition={validationResult.warnings.length > 0}
                show={
                    <WarningContainer>
                        <WarningHeader>
                            <strong>Warning!</strong> It is recommended to
                            verify the following information before importing.
                        </WarningHeader>
                        {validationResult.warnings.map(warning => (
                            <Box key={warning.message} sx={{ p: 2 }}>
                                <WarningMessage>
                                    {warning.message}
                                </WarningMessage>
                                <StyledItems>
                                    {warning.affectedItems.map(item => (
                                        <StyledItem key={item}>
                                            {item}
                                        </StyledItem>
                                    ))}
                                </StyledItems>
                            </Box>
                        ))}
                    </WarningContainer>
                }
            />
            <ActionsContainer>
                <Button
                    sx={{
                        position: 'static',
                        mr: 'auto',
                    }}
                    variant="outlined"
                    type="submit"
                    onClick={onBack}
                >
                    Back
                </Button>
                <PermissionButton
                    permission={CREATE_FEATURE}
                    projectId={project}
                    sx={{ position: 'static' }}
                    variant="contained"
                    type="submit"
                    onClick={onSubmit}
                    data-testid={IMPORT_CONFIGURATION_BUTTON}
                    disabled={
                        validationResult.errors.length > 0 ||
                        validationResult.permissions.length > 0 ||
                        !validJSON
                    }
                >
                    Import configuration
                </PermissionButton>
                <Button
                    sx={{ position: 'static', ml: 2 }}
                    variant="outlined"
                    type="submit"
                    onClick={onClose}
                >
                    Cancel import
                </Button>
            </ActionsContainer>
        </ImportLayoutContainer>
    );
};
