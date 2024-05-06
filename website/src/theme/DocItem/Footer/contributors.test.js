const commits = [
    {
        sha: '2754c26f2e022b623e46e08fc1108b350710ef91',
        node_id:
            'C_kwDOAXdJ9doAKDI3NTRjMjZmMmUwMjJiNjIzZTQ2ZTA4ZmMxMTA4YjM1MDcxMGVmOTE',
        url: 'https://api.github.com/repos/Unleash/unleash/commits/2754c26f2e022b623e46e08fc1108b350710ef91',
        html_url:
            'https://github.com/Unleash/unleash/commit/2754c26f2e022b623e46e08fc1108b350710ef91',
        comments_url:
            'https://api.github.com/repos/Unleash/unleash/commits/2754c26f2e022b623e46e08fc1108b350710ef91/comments',
        author: {
            login: 'markunl',
            id: 128738155,
            node_id: 'U_kgDOB6xjaw',
            avatar_url: 'https://avatars.githubusercontent.com/u/128738155?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/markunl',
            html_url: 'https://github.com/markunl',
            type: 'User',
            site_admin: false,
        },
    },
    {
        sha: 'd5fbd0b743cc99791d34864c70f78985cc83b2d8',
        node_id:
            'C_kwDOAXdJ9doAKGQ1ZmJkMGI3NDNjYzk5NzkxZDM0ODY0YzcwZjc4OTg1Y2M4M2IyZDg',
        url: 'https://api.github.com/repos/Unleash/unleash/commits/d5fbd0b743cc99791d34864c70f78985cc83b2d8',
        html_url:
            'https://github.com/Unleash/unleash/commit/d5fbd0b743cc99791d34864c70f78985cc83b2d8',
        comments_url:
            'https://api.github.com/repos/Unleash/unleash/commits/d5fbd0b743cc99791d34864c70f78985cc83b2d8/comments',
        author: {
            login: 'thomasheartman',
            id: 17786332,
            node_id: 'MDQ6VXNlcjE3Nzg2MzMy',
            avatar_url: 'https://avatars.githubusercontent.com/u/17786332?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/thomasheartman',
            html_url: 'https://github.com/thomasheartman',
            type: 'User',
            site_admin: false,
        },
    },
    {
        sha: 'ebcab898e7610082d3ada81ab0b729ba1f17655d',
        node_id:
            'C_kwDOAXdJ9doAKGViY2FiODk4ZTc2MTAwODJkM2FkYTgxYWIwYjcyOWJhMWYxNzY1NWQ',
        url: 'https://api.github.com/repos/Unleash/unleash/commits/ebcab898e7610082d3ada81ab0b729ba1f17655d',
        html_url:
            'https://github.com/Unleash/unleash/commit/ebcab898e7610082d3ada81ab0b729ba1f17655d',
        comments_url:
            'https://api.github.com/repos/Unleash/unleash/commits/ebcab898e7610082d3ada81ab0b729ba1f17655d/comments',
        author: {
            login: 'thomasheartman',
            id: 17786332,
            node_id: 'MDQ6VXNlcjE3Nzg2MzMy',
            avatar_url: 'https://avatars.githubusercontent.com/u/17786332?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/thomasheartman',
            html_url: 'https://github.com/thomasheartman',
            type: 'User',
            site_admin: false,
        },
    },
    {
        sha: 'ead86ed62191777895d5a5f1a7c58f16a87ebde7',
        node_id:
            'C_kwDOAXdJ9doAKGVhZDg2ZWQ2MjE5MTc3Nzg5NWQ1YTVmMWE3YzU4ZjE2YTg3ZWJkZTc',
        author: {
            login: 'thomasheartman',
            id: 17786332,
            node_id: 'MDQ6VXNlcjE3Nzg2MzMy',
            avatar_url: 'https://avatars.githubusercontent.com/u/17786332?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/thomasheartman',
            html_url: 'https://github.com/thomasheartman',
            type: 'User',
            site_admin: false,
        },
    },
];

const expectedContributors = [
    {
        login: 'thomasheartman',
        html_url: 'https://github.com/thomasheartman',
        avatar_url: 'https://avatars.githubusercontent.com/u/17786332?v=4',
    },
    {
        login: 'markunl',
        html_url: 'https://github.com/markunl',
        avatar_url: 'https://avatars.githubusercontent.com/u/128738155?v=4',
    },
];

test('getContributors should return the correct list of contributors', () => {
    const contributors = getContributors(commits);
    expect(contributors).toEqual(expectedContributors);
});
