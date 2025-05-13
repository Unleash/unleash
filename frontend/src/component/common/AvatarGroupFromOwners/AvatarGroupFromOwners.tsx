import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { ProjectSchemaOwners } from 'openapi';
import {
    type AvatarComponentType,
    AvatarGroup,
} from '../AvatarGroup/AvatarGroup.tsx';

type Props = {
    users: ProjectSchemaOwners;
    avatarLimit?: number;
    AvatarComponent?: AvatarComponentType;
    className?: string;
};
export const AvatarGroupFromOwners: React.FC<Props> = ({ users, ...props }) => {
    const { uiConfig } = useUiConfig();

    const mapOwners = (owner: ProjectSchemaOwners[number]) => {
        if (owner.ownerType === 'user') {
            return {
                name: owner.name,
                imageUrl: owner.imageUrl || undefined,
                email: owner.email || undefined,
            };
        }
        if (owner.ownerType === 'group') {
            return {
                name: owner.name,
            };
        }
        return {
            name: 'System',
            imageUrl: `${uiConfig.unleashUrl}/logo-unleash.png`,
        };
    };
    const mappedOwners = users.map(mapOwners);
    return <AvatarGroup users={mappedOwners} {...props} />;
};
