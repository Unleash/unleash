import type { IPermission } from 'interfaces/user';
import { PayloadType, type Variant } from 'utils/variants';
import { hasAccess } from 'component/providers/AccessProvider/AccessProvider';
import {
    ADMIN,
    CREATE_FEATURE,
    CREATE_PROJECT,
    CREATE_PROJECT_API_TOKEN,
} from 'component/providers/AccessProvider/permissions';

const DEFAULT_SETUP_PROMPT = `Help me connect my first Unleash feature flag to an application and see its behavior change when I toggle it.

Use the instance context provided at the end of this prompt, and verify access before making changes.

Read the current MCP setup instructions at https://github.com/Unleash/unleash-mcp and use https://docs.getunleash.io/ for current SDK and token guidance.

Use the clear, friendly, practical language of Unleash's getting-started docs. Keep updates short, explain what the next step achieves, and ask only for choices or information you need. Start with a brief description of what we will build and how a feature flag lets me change its behavior without editing or redeploying code. Introduce the project, environment, and SDK as we use them, with a sentence about their role in this application. Keep setup details and diagnostics out of the main explanation unless they are needed to move forward or I ask for them.

Reuse a suitable existing Unleash MCP connection. If none exists, help configure one for this agent, preserving existing MCP servers and settings. Ask before enabling remote MCP for the instance. Use local or remote MCP as appropriate; ask my preference when needed and explain any requirements. Perform supported setup steps automatically, and guide me through anything you cannot do. Let me complete authentication myself, keep tokens out of chat, and explain if a reload is necessary. Verify the connection by reading accessible projects. Discover the available tools and their schemas rather than assuming a particular MCP version.

When possible, check whether newer Unleash MCP or instance versions are available. Prefer the latest releases, and offer to update an older local MCP connection before continuing. For self-hosted Unleash, suggest the latest version and link to https://docs.getunleash.io/deploy/upgrading-unleash. Ask before changing an existing MCP setup, leave instance upgrades to the administrator, and continue with the current versions when the onboarding works.

Ask whether I want to add a flag to an existing application or create a demo, unless I have already specified. For an existing application, follow its language, framework, and conventions, reusing any existing Unleash integration. For a new demo, favor a small, engaging visual experience unless I request something else. Prioritize the most specific official Unleash SDK for the chosen technology. Backend applications are equally valid: choose a change I can observe through a request, command, or application interaction.

Start with the suggested project and environment when suitable. Verify my access, and offer another project or a separate demo project only when needed or requested and my permissions and edition allow it. Preserve existing work and avoid changing production configuration. For a new demo flag, prepare a 100% audience in a development environment while leaving the flag disabled, so my first toggle is enough to see the change.

The agent connection and application need separate credentials. If an SDK token requires manual creation, give me the selected project's API access link and explain “New API token” and the appropriate token settings. Reuse the known instance URL and prepare ignored local configuration so I only need to supply the token securely.

Run the application and verify a successful SDK fetch and the disabled behavior. Use a short, documented SDK refresh interval for a new demo. When it is ready, give me the app link, request, or command and the exact flag-page link. Explain which environment to toggle, what I should see, and how long the change should take. Give clear instructions when my input is needed, and let me try the application at my own pace. Invite me to turn the flag off and see the original behavior return.

When useful, use supported live observation to show actual changes as they happen. Otherwise, guide me to try the application myself. Never claim to be watching when you are not, or claim success from generated code alone.

After the successful toggle, briefly connect what I saw to how it works: Unleash holds the flag configuration, and the SDK uses it to decide which behavior the application runs. Reinforce that I controlled the feature without redeploying the application. If something did not work, troubleshoot it before celebrating success.

Finish with a short, encouraging recap and the useful app and flag links. Offer a relevant next step or a closer look at the code, and let me choose whether to continue. Avoid a broad product tour, a long technical handover, or unrequested cleanup.`;

export interface SetupPromptContext {
    remoteMcpEnabled?: boolean;
    permissions?: IPermission[];
    version?: string;
    isOss?: boolean;
    environment?: string;
}

export const getSetupPrompt = (
    instanceUrl: string,
    projectId: string,
    context: SetupPromptContext = {},
    aiSetup?: boolean | Variant,
) => {
    const payload = typeof aiSetup === 'object' ? aiSetup.payload : undefined;
    const instructions =
        payload?.type === PayloadType.STRING &&
        typeof payload.value === 'string'
            ? payload.value.trim() || DEFAULT_SETUP_PROMPT
            : DEFAULT_SETUP_PROMPT;
    const baseUrl = instanceUrl.replace(/\/+$/, '');
    const projectUrl = `${baseUrl}/projects/${encodeURIComponent(projectId)}`;
    const canManageRemoteMcp =
        hasAccess(context.permissions, ADMIN) && !context.isOss;
    const details = [
        `My Unleash instance is: ${baseUrl}`,
        `Suggested project: ${JSON.stringify(projectId)}`,
        `Project: ${projectUrl}`,
        `Project API access: ${projectUrl}/settings/api-access`,
    ];
    if (context.environment)
        details.push(
            `Suggested environment: ${JSON.stringify(context.environment)}`,
        );
    if (context.version) details.push(`Unleash version: ${context.version}`);
    if (context.isOss !== undefined)
        details.push(`Edition: ${context.isOss ? 'OSS' : 'Enterprise'}`);

    if (context.isOss) {
        details.push('Remote MCP: unavailable on OSS.');
    } else {
        const remoteMcpStatus =
            context.remoteMcpEnabled === undefined
                ? 'unknown'
                : context.remoteMcpEnabled
                  ? 'enabled'
                  : 'disabled';
        details.push(
            `Remote MCP: ${remoteMcpStatus}.`,
            `Remote MCP endpoint: ${baseUrl}/api/admin/mcp`,
        );
        if (context.remoteMcpEnabled === false && canManageRemoteMcp) {
            details.push(`Remote MCP settings: ${baseUrl}/admin/remote-mcp`);
        }
    }

    if (context.permissions !== undefined) {
        details.push(
            `Create flags in this project: ${hasAccess(context.permissions, CREATE_FEATURE, projectId) ? 'yes' : 'no'}`,
            `Create SDK tokens in this project: ${hasAccess(context.permissions, CREATE_PROJECT_API_TOKEN, projectId) ? 'yes' : 'no'}`,
            `Create projects: ${!context.isOss && hasAccess(context.permissions, CREATE_PROJECT) ? 'yes' : 'no'}`,
            `Manage remote MCP: ${canManageRemoteMcp ? 'yes' : 'no'}`,
        );
    }

    return `${instructions}

Context from Unleash when this prompt was copied (verify access before making changes):
${details.join('\n')}`;
};
