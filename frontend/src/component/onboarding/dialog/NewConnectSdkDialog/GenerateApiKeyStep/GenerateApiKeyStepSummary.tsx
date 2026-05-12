import { Badge } from 'component/common/Badge/Badge';
import { Truncator } from 'component/common/Truncator/Truncator';

export const GenerateApiKeyStepSummary = ({
    apiKey,
}: {
    apiKey?: string | null;
}) => {
    if (!apiKey) return null;
    return (
        <Badge color='neutral'>
            <Truncator title={apiKey} sx={{ maxWidth: 200 }}>
                {apiKey}
            </Truncator>
        </Badge>
    );
};
