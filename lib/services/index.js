const ProjectService = require('./project-service');
const StateService = require('./state-service');

module.exports.createServices = (stores, config) => ({
    projectService: new ProjectService(stores, config),
    stateService: new StateService(stores, config),
});
