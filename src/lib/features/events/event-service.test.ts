import type { ProjectAccess } from '../private-project/privateProjectStore';
import { filterAccessibleProjects } from './event-service';

describe('filterPrivateProjectsFromParams', () => {
    it('should return IS_ANY_OF with allowed projects when projectParam is undefined and mode is limited', () => {
        const projectAccess: ProjectAccess = {
            mode: 'limited',
            projects: ['project1', 'project2'],
        };

        const projectParam = undefined;

        const result = filterAccessibleProjects(projectParam, projectAccess);

        expect(result).toBe('IS_ANY_OF:project1,project2');
    });

    it('should return the original projectParam when mode is all', () => {
        const projectAccess: ProjectAccess = {
            mode: 'all',
        };

        const projectParam = 'IS:project1,IS:project3';

        const result = filterAccessibleProjects(projectParam, projectAccess);

        expect(result).toBe(projectParam);
    });

    it('should filter out projects not in allowedProjects when mode is limited', () => {
        const projectAccess: ProjectAccess = {
            mode: 'limited',
            projects: ['project1', 'project2'],
        };

        const projectParam = 'IS:project1,IS:project3';

        const result = filterAccessibleProjects(projectParam, projectAccess);

        expect(result).toBe('IS:project1');
    });

    it('should return a single project if only one is allowed', () => {
        const projectAccess: ProjectAccess = {
            mode: 'limited',
            projects: ['project1'],
        };

        const projectParam = 'IS:project1,IS:project2';

        const result = filterAccessibleProjects(projectParam, projectAccess);

        expect(result).toBe('IS:project1');
    });

    it('should throw an error if no projects match and not throw an error', () => {
        const projectAccess: ProjectAccess = {
            mode: 'limited',
            projects: ['project1', 'project2'],
        };

        const projectParam = 'IS:project3,IS:project4';

        expect(() =>
            filterAccessibleProjects(projectParam, projectAccess),
        ).toThrow('No accessible projects in the search parameters');
    });

    it('should return undefined if projectParam is undefined and projectAccess mode is all', () => {
        const projectAccess: ProjectAccess = {
            mode: 'all',
        };

        const projectParam = undefined;

        const result = filterAccessibleProjects(projectParam, projectAccess);

        expect(result).toBeUndefined();
    });

    it('should return the original projectParam if all projects are allowed when mode is limited', () => {
        const projectAccess: ProjectAccess = {
            mode: 'limited',
            projects: ['project1', 'project2', 'project3'],
        };

        const projectParam = 'IS:project1,IS:project2';

        const result = filterAccessibleProjects(projectParam, projectAccess);

        expect(result).toBe('IS:project1,IS:project2');
    });
});
