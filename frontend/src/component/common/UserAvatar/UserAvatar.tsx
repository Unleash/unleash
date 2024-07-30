import {
    Avatar,
    type AvatarProps,
    styled,
    type SxProps,
    type Theme,
} from '@mui/material';
import type { IUser } from 'interfaces/user';
import type { FC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { HtmlTooltip } from '../HtmlTooltip/HtmlTooltip';
const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(3.5),
    height: theme.spacing(3.5),
    margin: 'auto',
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.fontWeight.bold,
}));

export interface IUserAvatarProps extends AvatarProps {
    user?: Partial<
        Pick<IUser, 'id' | 'name' | 'email' | 'username' | 'imageUrl'>
    >;
    src?: string;
    title?: string;
    onMouseEnter?: (event: any) => void;
    onMouseLeave?: () => void;
    className?: string;
    sx?: SxProps<Theme>;
    hideTitle?: boolean;
}

const ActualUserAvatar = () => {
    // remember Admin, Admin token users, system users

    const adminTokenUser = {
        ownerType: 'user',
        name: 'Unleash Admin Token User',
        email: null,
        imageUrl:
            'https://gravatar.com/avatar/989553ee532211da1dfc7513e22e544afde4a4b06e03355448c1b1059e6a7e6d?s=42&d=retro&r=g',
    };

    const admin = {
        ownerType: 'user',
        name: 'admin',
        email: null,
        imageUrl:
            'https://gravatar.com/avatar/8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918?s=42&d=retro&r=g',
    };

    const systemUserPayload = {
        ownerType: 'system',
    };
    const systemUserArgument = {
        name: '',
        description: 'System',
        imageUrl: `{uiConfig.unleashUrl}/logo-unleash.png`,
    };

    const user = {
        ownerType: 'user',
        name: 'Mateusz K',
        email: 'mateusz@getunleash.ai',
        imageUrl:
            'https://gravatar.com/avatar/e8d327dcf41886ecb46697dca53d391aa3aa448b72a63a9dd8382dc32cc1651c?s=42&d=retro&r=g',
    };

    const userWithEverything = {
        name: 'Mateusz K',
        username: 'Big M',
        email: 'mateusz@getunleash.ai',
        id: 1,
        imageUrl:
            'https://gravatar.com/avatar/e8d327dcf41886ecb46697dca53d391aa3aa448b72a63a9dd8382dc32cc1651c?s=42&d=retro&r=g',
    };
};
const TextAvatar = () => {
    // two different use cases <- member count and group name
    // groups from project access tabl e
    const projectAccessGroup = {
        id: 1,
        name: 'unleash-e2e-7095756699593281', // <- this gets rendered in the tooltip
        rootRole: null,
        description: 'hello-world',
        mappingsSSO: [],
        createdBy: null,
        createdAt: '2023-04-26T14:07:02.721Z',
        scimId: null,
        users: [
            // ... omitted for brevity
        ],
        addedAt: '2024-05-30T08:27:43.870Z',
        roleId: 4,
        roles: [4],
    };

    const projectAccessCard = {
        name: 'owner.name' || '',
        description: 'group',
    };
};
const ServiceAccountAvatar = () => {
    // service accounts have names and usernames, but not emails
    const serviceAccount = {
        id: 5,
        name: 'x',
        username: 'service-x',
        imageUrl:
            'https://gravatar.com/avatar/efcfeb1fc37d313f4c7d34165628fe332501abe61062127ae24e1e89d9affcfa?s=42&d=retro&r=g',
        // ...
    };
};
const EmptyAvatar = () => {};

const tooltipContent = (
    user: IUserAvatarProps['user'],
): { main: string; secondary?: string } | undefined => {
    if (!user) {
        return undefined;
    }

    const [mainIdentifier, secondaryInfo] = [
        user.email || user.username,
        user.name,
    ];

    if (mainIdentifier) {
        return { main: mainIdentifier, secondary: secondaryInfo };
    } else if (secondaryInfo) {
        return { main: secondaryInfo };
    }
    return undefined;
};

export const UserAvatar: FC<IUserAvatarProps> = ({
    user,
    src,
    className,
    sx,
    children,
    ...props
}) => {
    let fallback: string | undefined;
    if (!children && user) {
        fallback = user?.name || user?.email || user?.username;
        if (fallback?.includes(' ')) {
            fallback = `${fallback.split(' ')[0][0]}${
                fallback.split(' ')[1][0]
            }`.toUpperCase();
        } else if (fallback) {
            fallback = fallback[0].toUpperCase();
        }
    }

    const StyledName = styled('div')(({ theme }) => ({
        color: theme.palette.text.secondary,
        fontSize: theme.typography.body2.fontSize,
    }));
    const StyledEmail = styled('div')(({ theme }) => ({
        fontSize: theme.typography.body1.fontSize,
    }));

    const Avatar = (
        <StyledAvatar
            className={className}
            sx={sx}
            {...props}
            data-loading
            alt={user?.name || user?.email || user?.username || 'Gravatar'}
            src={src || user?.imageUrl}
        >
            <ConditionallyRender
                condition={Boolean(fallback)}
                show={fallback}
                elseShow={children}
            />
        </StyledAvatar>
    );

    const tooltip = tooltipContent(user);
    if (tooltip) {
        return (
            <HtmlTooltip
                arrow
                describeChild
                title={
                    <>
                        <StyledName>{tooltip.secondary}</StyledName>
                        <StyledEmail>{tooltip.main}</StyledEmail>
                    </>
                }
            >
                {Avatar}
            </HtmlTooltip>
        );
    }

    return Avatar;
};
