import { Configuration, AdminApi } from 'openapi';
import { getBasePath } from 'utils/formatPath';

const createAdminApi = (): AdminApi => {
    return new AdminApi(
        new Configuration({
            basePath: getBasePath(),
        })
    );
};

export const openApiAdmin = createAdminApi();
