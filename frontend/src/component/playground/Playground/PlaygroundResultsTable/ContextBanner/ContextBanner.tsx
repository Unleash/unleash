import { colors } from 'themes/colors';
import { Alert, styled } from '@mui/material';
import { SdkContextSchema } from '../../playground.model';

interface IContextBannerProps {
    context: SdkContextSchema;
}

const StyledContextFieldList = styled('ul')(({theme}) => ({
    color: colors.black,
    listStyleType: 'none',
    paddingInlineStart: theme.spacing(16),
}));

export const ContextBanner = ({ context }: IContextBannerProps) => {
    return (
        <Alert severity="info" sx={{ my: 2 }}>
            Your results are generated based on this configuration
            <StyledContextFieldList>
                {Object.entries(context).map(([key, value]) => (
                    <li key={key}>{`${key}: ${value}`}</li>
                ))}
            </StyledContextFieldList>
        </Alert>
    );
};
