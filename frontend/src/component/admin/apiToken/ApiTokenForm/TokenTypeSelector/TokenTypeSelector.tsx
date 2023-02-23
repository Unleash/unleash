import { StyledContainer, StyledInputLabel } from '../ApiTokenForm.styles';
import {
    Box,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
} from '@mui/material';
import React from 'react';
import { TokenType } from '../../../../../interfaces/token';
import useUiConfig from '../../../../../hooks/api/getters/useUiConfig/useUiConfig';
import { useOptionalPathParam } from '../../../../../hooks/useOptionalPathParam';

interface ITokenTypeSelectorProps {
    type: string;
    setType: (value: string) => void;
}
export const TokenTypeSelector = ({
    type,
    setType,
}: ITokenTypeSelectorProps) => {
    const projectId = useOptionalPathParam('projectId');
    const { uiConfig } = useUiConfig();

    const selectableTypes = [
        {
            key: TokenType.CLIENT,
            label: `Server-side SDK (${TokenType.CLIENT})`,
            title: 'Connect server-side SDK or Unleash Proxy',
        },
    ];

    if (!projectId) {
        selectableTypes.push({
            key: TokenType.ADMIN,
            label: TokenType.ADMIN,
            title: 'Full access for managing Unleash',
        });
    }

    if (uiConfig.flags.embedProxyFrontend) {
        selectableTypes.splice(1, 0, {
            key: TokenType.FRONTEND,
            label: `Client-side SDK (${TokenType.FRONTEND})`,
            title: 'Connect web and mobile SDK directly to Unleash',
        });
    }
    return (
        <StyledContainer>
            <FormControl sx={{ mb: 2, width: '100%' }}>
                <StyledInputLabel id="token-type">
                    What do you want to connect?
                </StyledInputLabel>
                <RadioGroup
                    aria-labelledby="token-type"
                    defaultValue="CLIENT"
                    name="radio-buttons-group"
                    value={type}
                    onChange={(event, value) => setType(value)}
                >
                    {selectableTypes.map(({ key, label, title }) => (
                        <FormControlLabel
                            key={key}
                            value={key}
                            sx={{ mb: 1 }}
                            control={
                                <Radio
                                    sx={{
                                        ml: 0.75,
                                        alignSelf: 'flex-start',
                                    }}
                                />
                            }
                            label={
                                <Box>
                                    <Box>
                                        <Typography>{label}</Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {title}
                                        </Typography>
                                    </Box>
                                </Box>
                            }
                        />
                    ))}
                </RadioGroup>
            </FormControl>
        </StyledContainer>
    );
};
