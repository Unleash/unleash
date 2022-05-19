import { Configuration, AdminApi } from 'openapi';
import { basePath } from 'utils/formatPath';

const createAdminApi = (): AdminApi => {
    return new AdminApi(
        new Configuration({
            basePath,
        })
    );
};

export const openApiAdmin = createAdminApi();
