import { capitalize, MenuItem, Select, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { Role } from 'interfaces/group';
import { Badge } from 'component/common/Badge/Badge';
import { StarRounded } from '@mui/icons-material';
import { UG_USERS_TABLE_ROLE_ID } from 'utils/testIds';

const StyledPopupStar = styled(StarRounded)(({ theme }) => ({
    color: theme.palette.warning.main,
}));

interface IGroupUserRoleCellProps {
    value?: string;
    onChange?: (role: Role) => void;
}

export const GroupUserRoleCell = ({
    value = Role.Member,
    onChange,
}: IGroupUserRoleCellProps) => {
    const renderBadge = () => (
        <ConditionallyRender
            condition={value === Role.Member}
            show={<Badge>{capitalize(value)}</Badge>}
            elseShow={
                <Badge color="success" icon={<StyledPopupStar />}>
                    {capitalize(value)}
                </Badge>
            }
        />
    );

    return (
        <TextCell>
            <ConditionallyRender
                condition={Boolean(onChange)}
                show={
                    <Select
                        data-testid={UG_USERS_TABLE_ROLE_ID}
                        size="small"
                        value={value}
                        onChange={event =>
                            onChange!(event.target.value as Role)
                        }
                    >
                        {Object.values(Role).map(role => (
                            <MenuItem key={role} value={role}>
                                {role}
                            </MenuItem>
                        ))}
                    </Select>
                }
                elseShow={() => renderBadge()}
            />
        </TextCell>
    );
};
