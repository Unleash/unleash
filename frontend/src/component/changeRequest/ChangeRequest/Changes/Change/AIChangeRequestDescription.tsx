import { styled } from '@mui/material';
import type { IFeatureChange } from 'component/changeRequest/changeRequest.types';
import { AIMessage } from 'component/common/AI/AIMessage';
import { useAI } from 'hooks/api/actions/useAI/useAI';
import { useEffect, useState } from 'react';

export const StyledMessage = styled('div')(({ theme }) => ({
    background: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    border: `1px solid ${theme.palette.secondary.border}`,
    padding: theme.spacing(2),
}));

export const AIChangeRequestDescription = ({
    changes,
}: { changes: IFeatureChange[] }) => {
    const { prompt } = useAI();
    const [response, setResponse] = useState<string | undefined>();

    const changesBlock = `\`\`\`\n${JSON.stringify(changes)}\n\`\`\``;
    const message = `Please parse these changes into a concise, easy-to-understand, human-readable description:\n\n${changesBlock}\nWe support markdown and don't care about profile pictures. You should handle weight by dividing it by 10 and assuming it's a percentage. Don't mention weight otherwise. Only include the changes, without any auxiliary text in the response.`;

    const load = async () => {
        const response = await prompt(message); // TODO: Might be broken after recent changes
        setResponse(response);
    };

    useEffect(() => {
        load();
    }, []);

    if (!response) return null;

    return (
        <StyledMessage>
            <AIMessage>{response}</AIMessage>
        </StyledMessage>
    );
};
