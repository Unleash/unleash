const adminUser = (): { hook: (app: any) => void } => {
    return {
        hook(app) {
            app.use((req, _res, next) => {
                req.user = {
                    isAPI: true,
                    id: 1,
                    email: 'unknown',
                    permissions: ['ADMIN'],
                };
                next();
            });
        },
    };
};

export default adminUser;
