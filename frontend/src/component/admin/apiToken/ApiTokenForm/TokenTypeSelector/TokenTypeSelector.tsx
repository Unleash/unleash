import { StyledContainer, StyledInputLabel } from '../ApiTokenForm.styles';
import {
    Box,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
} from '@mui/material';
import { TokenType } from '../../../../../interfaces/token';
import useUiConfig from '../../../../../hooks/api/getters/useUiConfig/useUiConfig';
import { useOptionalPathParam } from '../../../../../hooks/useOptionalPathParam';
import {
    ADMIN,
    CREATE_FRONTEND_API_TOKEN,
    CREATE_CLIENT_API_TOKEN,
} from '@server/types/permissions';
import { useHasRootAccess } from 'hooks/useHasAccess';

interface ITokenTypeSelectorProps {
    type: string;
    setType: (value: string) => void;
    apiTokenTypes: {
        key: string;
        label: string;
        title: string;
        permission: string | string[];
    }[];
}
export const TokenTypeSelector = ({
    type,
    setType,
    apiTokenTypes,
}: ITokenTypeSelectorProps) => {
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
                    {apiTokenTypes.map(({ key, label, title, permission }) => (
                        <FormControlLabel
                            key={key}
                            value={key}
                            sx={{ mb: 1 }}
                            disabled={!useHasRootAccess(permission)}
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
