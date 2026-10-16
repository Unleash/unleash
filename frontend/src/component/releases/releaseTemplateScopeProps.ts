export const releaseTemplateScopeProps = (
    project?: string | null,
): { scope: 'global' | 'project' } => ({
    scope: project ? 'project' : 'global',
});
