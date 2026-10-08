import { StyledHelpText, StyledTitle } from '../IntegrationForm.styles';
import { Alert, Box, Button, styled } from '@mui/material';
import type { AddonSchema, AddonTypeSchema } from 'openapi';
import useQueryParams from 'hooks/useQueryParams';
import { formatApiPath } from 'utils/formatPath';
import { formatIntegrationApiPath } from '../../integrationPaths.ts';

export interface IIntegrationServerInstallProps {
    path: string;
    title?: string;
    helpText?: string;
    parameters: AddonSchema['parameters'];
    definitions?: AddonTypeSchema['parameters'];
    projectId?: string;
}

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    columnGap: theme.spacing(3),
    [theme.breakpoints.down('sm')]: { flexDirection: 'column' },
}));

// Sensitive parameters are left out, since they would end up in the URL.
const nonSensitiveParameters = (
    parameters: AddonSchema['parameters'],
    definitions: AddonTypeSchema['parameters'] = [],
): URLSearchParams =>
    new URLSearchParams(
        definitions.flatMap(({ name, sensitive }) => {
            const value = parameters[name];
            return !sensitive && typeof value === 'string'
                ? [[`parameters[${name}]`, value]]
                : [];
        }),
    );

export const IntegrationServerInstall = ({
    path,
    title = 'Install addon',
    helpText = 'Click this button to install this integration.',
    parameters,
    definitions,
    projectId,
}: IIntegrationServerInstallProps) => {
    const errorMsg = useQueryParams().get('errorMsg');

    return (
        <Box>
            <StyledTitle>{title}</StyledTitle>
            {errorMsg ? (
                <Alert severity='error' sx={{ mb: 2 }}>
                    {errorMsg}
                </Alert>
            ) : null}
            <StyledBox>
                <Box>
                    <StyledHelpText>{helpText}</StyledHelpText>
                </Box>
                <Box>
                    <Button
                        variant='contained'
                        href={formatApiPath(
                            `${formatIntegrationApiPath(projectId)}/${path}?${nonSensitiveParameters(parameters, definitions)}`,
                        )}
                    >
                        Install&nbsp;&amp;&nbsp;connect
                    </Button>
                </Box>
            </StyledBox>
        </Box>
    );
};
