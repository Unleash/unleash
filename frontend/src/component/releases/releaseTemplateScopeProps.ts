type ReleaseTemplateScopeProps =
    | { scope: 'global' }
    | { scope: 'project'; project: string };

export const releaseTemplateScopeProps = (
    project?: string | null,
): ReleaseTemplateScopeProps =>
    project ? { scope: 'project', project } : { scope: 'global' };
