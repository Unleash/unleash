const NotFoundError = require('../../lib/error/notfound-error');

module.exports = (databaseIsUp = true) => {
    const _projects = [];
    return {
        create: project => {
            _projects.push(project);
            return Promise.resolve();
        },
        getAll: () => {
            if (databaseIsUp) {
                return Promise.resolve(_projects);
            }
            return Promise.reject(new Error('Database is down'));
        },
        importProjects: projects => {
            projects.forEach(project => {
                _projects.push(project);
            });
            return Promise.resolve(_projects);
        },
        dropProjects: () => {
            _projects.splice(0, _projects.length);
        },
        hasProject: id => {
            const project = _projects.find(p => p.id === id);
            if (project) {
                return Promise.resolve(project);
            }
            return Promise.reject(
                new NotFoundError(`Could not find project with id ${id}`),
            );
        },
    };
};
