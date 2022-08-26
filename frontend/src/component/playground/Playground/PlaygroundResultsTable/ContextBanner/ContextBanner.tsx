import { colors } from 'themes/colors';
import { Alert, styled } from '@mui/material';
import { SdkContextSchema } from 'component/playground/Playground/interfaces/playground.model';

interface IContextBannerProps {
    environment: string;
    projects?: string | string[];
    context: SdkContextSchema;
}

const StyledContextFieldList = styled('ul')(({ theme }) => ({
    color: colors.black,
    listStyleType: 'none',
    padding: theme.spacing(2),
}));

export const ContextBanner = ({
    environment,
    projects = [],
    context,
}: IContextBannerProps) => {
    return (
        <Alert severity="info" sx={{ mt: 4, mb: 2, mx: 4 }}>
            Your results are generated based on this configuration:
            <StyledContextFieldList>
                <li>environment: {environment}</li>
                <li>
                    projects:{' '}
                    {Array.isArray(projects) ? projects.join(', ') : projects}
                </li>
                {Object.entries(context).map(([key, value]) => (
                    <li key={key}>
                        <span>{key}:</span> {value}
                    </li>
                ))}
            </StyledContextFieldList>
        </Alert>
    );
};
