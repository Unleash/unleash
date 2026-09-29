import { ToggleCard, ToggleCardDescription } from './ToggleCard.tsx';

interface IRemoteMcpFeedbackToggleProps {
    feedbackOptIn: boolean;
    onChange: (feedbackOptIn: boolean) => void;
    disabled?: boolean;
}

export const RemoteMcpFeedbackToggle = ({
    feedbackOptIn,
    onChange,
    disabled = false,
}: IRemoteMcpFeedbackToggleProps) => (
    <ToggleCard
        title='Send feedback from the Remote MCP Server to Unleash'
        checked={feedbackOptIn}
        onChange={onChange}
        disabled={disabled}
    >
        <ToggleCardDescription>
            When enabled, the MCP server shares anonymous diagnostic feedback
            with Unleash to help improve the service.
        </ToggleCardDescription>
        <ToggleCardDescription>
            Reports contain only the issue type, the tool name, a normalized
            error code, the MCP server version, the client name and version, and
            a short summary. They never include flag names, project IDs, code,
            URLs, or tokens. This setting only takes effect while the Remote MCP
            Server is enabled.
        </ToggleCardDescription>
    </ToggleCard>
);
