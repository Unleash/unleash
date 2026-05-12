import { Badge } from 'component/common/Badge/Badge';
import { Truncator } from 'component/common/Truncator/Truncator';

interface IGenerateApiKeySummaryProps {
    apiKey?: string | null;
}

export const GenerateApiKeySummary = ({
    apiKey,
}: IGenerateApiKeySummaryProps) => {
    if (!apiKey) return null;
    return (
        <Badge color='neutral'>
            <Truncator title={apiKey} sx={{ maxWidth: 200 }}>
                {apiKey}
            </Truncator>
        </Badge>
    );
};
