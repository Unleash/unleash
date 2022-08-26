import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { IPermission } from 'interfaces/user';

type objectIdx = {
    [key: string]: string;
};

export const projectFilterGenerator = (
    permissions: IPermission[] = [],
    matcherPermission: string
): ((projectId: string) => boolean) => {
    let admin = false;

    const permissionMap: objectIdx = permissions.reduce(
        (acc: objectIdx, p: IPermission) => {
            if (p.permission === ADMIN) {
                admin = true;
            }

            if (p.project && p.permission === matcherPermission) {
                acc[p.project] = matcherPermission;
            }

            return acc;
        },
        {}
    );

    return (projectId: string) => {
        return admin || Boolean(permissionMap[projectId]);
    };
};
