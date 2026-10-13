import { styled, Typography } from '@mui/material';
import type { CreateFeatureNamingPatternSchema } from 'openapi';

const StyledHint = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

const StyledPattern = styled('code')({
    overflowWrap: 'anywhere',
});

type NamingPatternHintProps = {
    id: string;
    naming: CreateFeatureNamingPatternSchema;
};

export const NamingPatternHint = ({ id, naming }: NamingPatternHintProps) => {
    const guidance = [
        naming.description,
        naming.example ? `e.g. ${naming.example}` : undefined,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <StyledHint id={id}>
            <strong>Naming pattern:</strong> {guidance}{' '}
            <StyledPattern>^{naming.pattern}$</StyledPattern>
        </StyledHint>
    );
};
