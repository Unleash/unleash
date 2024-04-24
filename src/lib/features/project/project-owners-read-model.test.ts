// describe.only('get projects owners', () => {
//     test('returns empty list if there is no project with an owner', async () => {
//         const owners = await projectOwnersReadModel();
//         expect(owners).toHaveLength(0);
//     })

//     test('returns an user who created a project as an owner', async () => {
//         const project = {
//             id: 'project-owners',
//             name: 'Project Owners',
//             mode: 'open' as const,
//             defaultStickiness: 'clientId',
//         };

//         const owner = await stores.userStore.insert({
//             name: 'Owner',
//             email: 'owner-test@example.com'
//         });

//         await projectService.createProject(project, owner, auditUser);

//         const owners = await projectService.getProjectsOwners();
//         expect(owners).toHaveLength(1);
//     })
// });
