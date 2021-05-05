import { ADMIN } from '../component/AccessProvider/permissions';
import IAuthStatus, { IPermission } from '../interfaces/user';

type objectIdx = {
    [key: string]: string;
};

export const projectFilterGenerator = (
    user: IAuthStatus,
    matcherPermission: string
) => {
    let admin = false;
    const permissionMap: objectIdx = user.permissions.reduce(
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
    return (project: string) => {
        if (admin) {
            return true;
        }

        if (permissionMap[project]) {
            return true;
        }
        return false;
    };
};
