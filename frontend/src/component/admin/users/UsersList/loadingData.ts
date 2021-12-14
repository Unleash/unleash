import { IUser } from '../../../../interfaces/user';

const loadingData: IUser[] = [
    {
        id: 1,
        username: 'admin',
        email: 'some-email@email.com',
        name: 'admin',
        permissions: ['ADMIN'],
        imageUrl:
            'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
        seenAt: null,
        loginAttempts: 0,
        createdAt: '2021-04-21T12:09:55.923Z',
        rootRole: 1,
        inviteLink: '',
    },
    {
        id: 16,
        name: 'test',
        email: 'test@test.no',
        permissions: [],
        imageUrl:
            'https://gravatar.com/avatar/879fdbb54e4a6cdba456fcb11abe5971?size=42&default=retro',
        seenAt: null,
        loginAttempts: 0,
        createdAt: '2021-04-21T15:54:02.765Z',
        rootRole: 2,
        inviteLink: '',
    },
    {
        id: 3,
        name: 'Testesen',
        email: 'test@test.com',
        permissions: [],
        imageUrl:
            'https://gravatar.com/avatar/6c15d63f08137733ec0828cd0a3a5dc4?size=42&default=retro',
        seenAt: '2021-04-21T14:34:31.515Z',
        loginAttempts: 0,
        createdAt: '2021-04-21T12:33:17.712Z',
        rootRole: 1,
        inviteLink: '',
    },
    {
        id: 4,
        name: 'test',
        email: 'test@test.io',
        permissions: [],
        imageUrl:
            'https://gravatar.com/avatar/879fdbb54e4a6cdba456fcb11abe5971?size=42&default=retro',
        seenAt: null,
        loginAttempts: 0,
        createdAt: '2021-04-21T15:54:02.765Z',
        rootRole: 2,
        inviteLink: '',
    },
    {
        id: 5,
        name: 'Testesen',
        email: 'test@test.uk',
        permissions: [],
        imageUrl:
            'https://gravatar.com/avatar/6c15d63f08137733ec0828cd0a3a5dc4?size=42&default=retro',
        seenAt: '2021-04-21T14:34:31.515Z',
        loginAttempts: 0,
        createdAt: '2021-04-21T12:33:17.712Z',
        rootRole: 1,
        inviteLink: '',
    },
];

export default loadingData;
