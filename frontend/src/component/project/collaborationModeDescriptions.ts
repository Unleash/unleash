import type { ProjectSchemaMode } from 'openapi';

export const collaborationModeDescriptions: Record<ProjectSchemaMode, string> =
    {
        open: 'Everyone can submit change requests',
        protected: 'Only admins and project members can submit change requests',
        private:
            'Only admins, editors and project members can see and access the project and associated feature flags',
    };
