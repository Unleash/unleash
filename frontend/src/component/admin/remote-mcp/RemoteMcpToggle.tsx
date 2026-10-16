import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ToggleCard, ToggleCardDescription } from './ToggleCard.tsx';

interface IRemoteMcpToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
}

export const RemoteMcpToggle = ({
    enabled,
    onChange,
    disabled = false,
}: IRemoteMcpToggleProps) => {
    const {
        uiConfig: { unleashUrl },
    } = useUiConfig();

    return (
        <ToggleCard
            title='Enable Remote MCP Server for this instance'
            checked={enabled}
            onChange={onChange}
            disabled={disabled}
        >
            <ToggleCardDescription>
                When enabled, Unleash exposes a Streamable HTTP MCP server at{' '}
                <code>{unleashUrl}/api/admin/mcp</code>
            </ToggleCardDescription>
            <ToggleCardDescription>
                Authentication uses standard Unleash PAT tokens — once enabled,
                users will be able to exchange their current login session for a
                PAT token, valid for 24h.
            </ToggleCardDescription>
        </ToggleCard>
    );
};
