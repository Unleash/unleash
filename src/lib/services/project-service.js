const NameExistsError = require('../error/name-exists-error');
const InvalidOperationError = require('../error/invalid-operation-error');
const eventType = require('../event-type');
const { nameType } = require('../routes/admin-api/util');
const schema = require('./project-schema');

class ProjectService {
    constructor(
        { projectStore, eventStore, featureToggleStore },
        { getLogger },
    ) {
        this.projectStore = projectStore;
        this.eventStore = eventStore;
        this.featureToggleStore = featureToggleStore;
        this.logger = getLogger('services/project-service.js');
    }

    async getProjects() {
        return this.projectStore.getAll();
    }

    async getProject(id) {
        return this.projectStore.get(id);
    }

    async createProject(newProject, username) {
        const data = await schema.validateAsync(newProject);
        await this.validateUniqueId(data.id);
        await this.eventStore.store({
            type: eventType.PROJECT_CREATED,
            createdBy: username,
            data,
        });
        await this.projectStore.create(data);
    }

    async updateProject(updatedProject, username) {
        await this.projectStore.get(updatedProject.id);
        const project = await schema.validateAsync(updatedProject);
        await this.eventStore.store({
            type: eventType.PROJECT_UPDATED,
            createdBy: username,
            data: project,
        });
        await this.projectStore.update(project);
    }

    async deleteProject(id, username) {
        if (id === 'default') {
            throw new InvalidOperationError(
                'You can not delete the default project!',
            );
        }

        const toggles = await this.featureToggleStore.getFeaturesBy({
            project: id,
            archived: 0,
        });

        if (toggles.length > 0) {
            throw new InvalidOperationError(
                'You can not delete as project with active feature toggles',
            );
        }

        await this.eventStore.store({
            type: eventType.PROJECT_DELETED,
            createdBy: username,
            data: { id },
        });
        await this.projectStore.delete(id);
    }

    async validateId(id) {
        await nameType.validateAsync(id);
        await this.validateUniqueId(id);
        return true;
    }

    async validateUniqueId(id) {
        try {
            await this.projectStore.hasProject(id);
        } catch (error) {
            // No conflict, everything ok!
            return;
        }

        // Interntional throw here!
        throw new NameExistsError('A project with this id already exists.');
    }
}

module.exports = ProjectService;
