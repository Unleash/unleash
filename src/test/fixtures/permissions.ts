const adminUser = (): { hook: (app: any) => void } => {
    return {
        hook(app) {
            app.use((req, res, next) => {
                req.user = {
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
