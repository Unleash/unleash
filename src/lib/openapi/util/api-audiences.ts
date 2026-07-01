export const apiAudiences = {
    public: {
        description:
            'Legacy/default external API audience. Historically most endpoints lived here with similar support expectations; over time, endpoints may be reclassified to more specific audiences (for example integration, sdk, or unleash-ui) as intent becomes clearer.',
    },
    integration: {
        description:
            'Intended for specific supported integrations (for example Terraform or Jira).',
    },
    sdk: {
        description:
            'Intended for Unleash SDKs, with the strictest compatibility expectations.',
    },
    'unleash-ui': {
        description:
            'Intended to serve the Unleash UI. Not recommended for external integrations.',
    },
    internal: {
        description:
            'Internal-only use. Not intended for customers or integrations.',
    },
} as const;

export type ApiAudience = keyof typeof apiAudiences;
