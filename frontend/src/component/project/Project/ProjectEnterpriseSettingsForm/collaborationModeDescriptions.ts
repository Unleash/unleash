import type { ProjectMode } from '../hooks/useProjectEnterpriseSettingsForm.ts';

export const collaborationModeDescriptions: Record<ProjectMode, string> = {
    open: 'Everyone can submit change requests',
    protected: 'Only admins and project members can submit change requests',
    private:
        'Only admins, editors and project members can see and access the project and associated feature flags',
};
