import {
    Box,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
} from '@mui/material';
import { FormField } from 'component/common/FormField/FormField';
import type { TokenType } from 'interfaces/token';

export type SelectOption = {
    key: string;
    label: string;
    title: string;
    enabled: boolean;
};

interface ITokenTypeSelectorProps {
    type: string;
    setType: (value: TokenType) => void;
    apiTokenTypes: SelectOption[];
}
export const TokenTypeSelector = ({
    type,
    setType,
    apiTokenTypes,
}: ITokenTypeSelectorProps) => {
    return (
        <FormField
            label='Token type'
            description='What do you want to connect?'
        >
            <RadioGroup
                aria-label='Token type'
                defaultValue='CLIENT'
                name='radio-buttons-group'
                value={type}
                onChange={(_, value) => setType(value as TokenType)}
            >
                {apiTokenTypes.map(
                    ({ key, label, title, enabled: hasAccess }) => (
                        <FormControlLabel
                            key={key}
                            value={key}
                            sx={{ mb: 1 }}
                            disabled={!hasAccess}
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
                                            variant='body2'
                                            sx={{
                                                color: 'text.secondary',
                                            }}
                                        >
                                            {title}
                                        </Typography>
                                    </Box>
                                </Box>
                            }
                        />
                    ),
                )}
            </RadioGroup>
        </FormField>
    );
};
