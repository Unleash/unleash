import { ADMIN } from '../component/providers/AccessProvider/permissions';
import { IPermission } from '../interfaces/user';

type objectIdx = {
    [key: string]: string;
};

export const projectFilterGenerator = (
    permissions: IPermission[] = [],
    matcherPermission: string
) => {
    let admin = false;
    const permissionMap: objectIdx = permissions.reduce(
        (acc: objectIdx, current: IPermission) => {
            if (current.permission === ADMIN) {
                admin = true;
            }

            if (current.permission === matcherPermission) {
                acc[current.project] = matcherPermission;
            }
            return acc;
        },
        {}
    );
    return (projectId: string) => {
        return admin || permissionMap[projectId];
    };
};
