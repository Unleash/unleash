import moment from 'moment';
import User from '../types/user';
import { AccessService, IUserWithRole, RoleName } from './access-service';
import ProjectStore, { IProject } from '../db/project-store';
import EventStore from '../db/event-store';
import NameExistsError from '../error/name-exists-error';
import InvalidOperationError from '../error/invalid-operation-error';
import { nameType } from '../routes/admin-api/util';
import schema from './project-schema';
import NotFoundError from '../error/notfound-error';
import FeatureToggleStore from '../db/feature-toggle-store';
import { IRole } from '../db/access-store';
import {
    PROJECT_CREATED,
    PROJECT_DELETED,
    PROJECT_UPDATED,
} from '../types/events';
import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import FeatureTypeStore from '../db/feature-type-store';
import { FeatureToggle } from '../types/model';
import Timer = NodeJS.Timer;

const getCreatedBy = (user: User) => user.email || user.username;

const MILLISECONDS_IN_DAY = 86400000;

const ONE_HOUR = 3600000;

const DEFAULT_PROJECT = 'default';

export interface UsersWithRoles {
    users: IUserWithRole[];
    roles: IRole[];
}

export default class ProjectService {
    private projectStore: ProjectStore;

    private accessService: AccessService;

    private eventStore: EventStore;

    private featureToggleStore: FeatureToggleStore;

    private featureTypeStore: FeatureTypeStore;

    private logger: any;

    private timers: Timer[] = [];

    constructor(
        {
            projectStore,
            eventStore,
            featureToggleStore,
            featureTypeStore,
        }: Pick<
            IUnleashStores,
            | 'projectStore'
            | 'eventStore'
            | 'featureToggleStore'
            | 'featureTypeStore'
        >,
        config: IUnleashConfig,
        accessService: AccessService,
    ) {
        this.projectStore = projectStore;
        this.accessService = accessService;
        this.eventStore = eventStore;
        this.featureToggleStore = featureToggleStore;
        this.featureTypeStore = featureTypeStore;
        this.logger = config.getLogger('services/project-service.js');
        this.timers.push(
            setInterval(() => this.setHealthRating(), ONE_HOUR).unref(),
        );
        process.nextTick(() => this.setHealthRating());
    }

    async setHealthRating(): Promise<void> {
        const projects = await this.getProjects();

        await Promise.all(
            projects.map(async project => {
                const newHealth = await this.calculateHealthRating(project);
                await this.projectStore.updateHealth({
                    id: project.id,
                    health: newHealth,
                });
            }),
        );
    }

    private async getPotentiallyStaleToggles(
        activeToggles,
    ): Promise<FeatureToggle[]> {
        const today = new Date().valueOf();
        const featureTypes = await this.featureTypeStore.getAll();

        const featureTypeMap = featureTypes.reduce((acc, current) => {
            acc[current.id] = current.lifetimeDays;

            return acc;
        }, {});

        return activeToggles.filter(feature => {
            const diff = today - feature.createdAt.valueOf();
            return diff > featureTypeMap[feature.type] * MILLISECONDS_IN_DAY;
        });
    }

    private getHealthRating(
        toggleCount: number,
        staleToggleCount: number,
        potentiallyStaleCount: number,
    ): number {
        const startPercentage = 100;
        const stalePercentage = (staleToggleCount / toggleCount) * 100 || 0;
        const potentiallyStalePercentage =
            (potentiallyStaleCount / toggleCount) * 100 || 0;
        const rating = Math.round(
            startPercentage - stalePercentage - potentiallyStalePercentage,
        );
        return rating;
    }

    async calculateHealthRating(project: IProject): Promise<number> {
        const toggles = await this.featureToggleStore.getFeaturesBy({
            project: project.id,
        });

        const activeToggles = toggles.filter(feature => !feature.stale);
        const staleToggles = toggles.length - activeToggles.length;
        const potentiallyStaleToggles = await this.getPotentiallyStaleToggles(
            activeToggles,
        );
        return this.getHealthRating(
            toggles.length,
            staleToggles,
            potentiallyStaleToggles.length,
        );
    }

    async getProjects(): Promise<IProject[]> {
        return this.projectStore.getAll();
    }

    async getProject(id: string): Promise<IProject> {
        return this.projectStore.get(id);
    }

    async createProject(newProject: IProject, user: User): Promise<IProject> {
        const data = await schema.validateAsync(newProject);
        await this.validateUniqueId(data.id);

        await this.projectStore.create(data);

        await this.accessService.createDefaultProjectRoles(user, data.id);

        await this.eventStore.store({
            type: PROJECT_CREATED,
            createdBy: getCreatedBy(user),
            data,
        });

        return data;
    }

    async updateProject(updatedProject: IProject, user: User): Promise<void> {
        await this.projectStore.get(updatedProject.id);
        const project = await schema.validateAsync(updatedProject);

        await this.projectStore.update(project);

        await this.eventStore.store({
            type: PROJECT_UPDATED,
            createdBy: getCreatedBy(user),
            data: project,
        });
    }

    async deleteProject(id: string, user: User): Promise<void> {
        if (id === DEFAULT_PROJECT) {
            throw new InvalidOperationError(
                'You can not delete the default project!',
            );
        }

        const toggles = await this.featureToggleStore.getFeaturesBy({
            project: id,
            archived: false,
        });

        if (toggles.length > 0) {
            throw new InvalidOperationError(
                'You can not delete a project with active feature toggles',
            );
        }

        await this.projectStore.delete(id);

        await this.eventStore.store({
            type: PROJECT_DELETED,
            createdBy: getCreatedBy(user),
            data: { id },
        });

        this.accessService.removeDefaultProjectRoles(user, id);
    }

    async validateId(id: string): Promise<boolean> {
        await nameType.validateAsync(id);
        await this.validateUniqueId(id);
        return true;
    }

    async validateUniqueId(id: string): Promise<void> {
        try {
            await this.projectStore.hasProject(id);
        } catch (error) {
            // No conflict, everything ok!
            return;
        }

        // Intentional throw here!
        throw new NameExistsError('A project with this id already exists.');
    }

    // RBAC methods
    async getUsersWithAccess(projectId: string): Promise<UsersWithRoles> {
        const [roles, users] = await this.accessService.getProjectRoleUsers(
            projectId,
        );

        return {
            roles,
            users,
        };
    }

    async addUser(
        projectId: string,
        roleId: number,
        userId: number,
    ): Promise<void> {
        const [roles, users] = await this.accessService.getProjectRoleUsers(
            projectId,
        );

        const role = roles.find(r => r.id === roleId);
        if (!role) {
            throw new NotFoundError(
                `Could not find roleId=${roleId} on project=${projectId}`,
            );
        }

        const alreadyHasAccess = users.some(u => u.id === userId);
        if (alreadyHasAccess) {
            throw new Error(`User already have access to project=${projectId}`);
        }

        await this.accessService.addUserToRole(userId, role.id);
    }

    async removeUser(
        projectId: string,
        roleId: number,
        userId: number,
    ): Promise<void> {
        const roles = await this.accessService.getRolesForProject(projectId);
        const role = roles.find(r => r.id === roleId);
        if (!role) {
            throw new NotFoundError(
                `Couldn't find roleId=${roleId} on project=${projectId}`,
            );
        }

        if (role.name === RoleName.OWNER) {
            const users = await this.accessService.getUsersForRole(role.id);
            if (users.length < 2) {
                throw new Error('A project must have at least one owner');
            }
        }

        await this.accessService.removeUserFromRole(userId, role.id);
    }
}

module.exports = ProjectService;
