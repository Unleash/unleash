import { styled } from '@mui/material';
import type { IGroup } from 'interfaces/group';
import { Link } from 'react-router-dom';
import { GroupCardActions } from './GroupCardActions.tsx';
import { RoleBadge } from 'component/common/RoleBadge/RoleBadge';
import { useScimSettings } from 'hooks/api/getters/useScimSettings/useScimSettings';
import GroupsIcon from '@mui/icons-material/GroupsOutlined';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { Truncator } from 'component/common/Truncator/Truncator';
import { Card } from 'component/common/Card/Card';
import { GroupCardFooter } from './GroupCardFooter.tsx';

const StyledCardLink = styled(Link)(({ theme }) => ({
    color: 'inherit',
    textDecoration: 'none',
    border: 'none',
    padding: '0',
    background: 'transparent',
    fontFamily: theme.typography.fontFamily,
    pointer: 'cursor',
}));

const StyledCardTitle = styled('h3')(({ theme }) => ({
    margin: 0,
    marginRight: 'auto',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: '1.2',
}));

interface IGroupCardProps {
    group: IGroup;
    onEditUsers: (group: IGroup) => void;
    onRemoveGroup: (group: IGroup) => void;
}

export const GroupCard = ({
    group,
    onEditUsers,
    onRemoveGroup,
}: IGroupCardProps) => {
    const { searchQuery } = useSearchHighlightContext();

    const {
        settings: { enabled: scimEnabled },
    } = useScimSettings();

    const isScimGroup = scimEnabled && Boolean(group.scimId);

    const title = (
        <Truncator title={group.name} arrow component={StyledCardTitle}>
            <Highlighter search={searchQuery}>{group.name}</Highlighter>
        </Truncator>
    );

    const headerActions = (
        <>
            {group.rootRole && <RoleBadge roleId={group.rootRole!} hideIcon />}
            <GroupCardActions
                groupId={group.id}
                onEditUsers={() => onEditUsers(group)}
                onRemove={() => onRemoveGroup(group)}
                isScimGroup={isScimGroup}
            />
        </>
    );

    const body = group.description && (
        <Truncator lines={2} title={group.description} arrow>
            <Highlighter search={searchQuery}>{group.description}</Highlighter>
        </Truncator>
    );

    return (
        <StyledCardLink to={`/admin/groups/${group.id}`}>
            <Card
                title={title}
                icon={<GroupsIcon />}
                headerActions={headerActions}
                footer={<GroupCardFooter group={group} />}
            >
                {body}
            </Card>
        </StyledCardLink>
    );
};
