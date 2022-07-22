import { capitalize, MenuItem, Select, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { Role } from 'interfaces/group';

const StyledBadge = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.5, 1),
    textDecoration: 'none',
    color: theme.palette.text.secondary,
    border: `1px solid ${theme.palette.dividerAlternative}`,
    background: theme.palette.activityIndicators.unknown,
    display: 'inline-block',
    borderRadius: theme.shape.borderRadius,
    marginLeft: theme.spacing(1.5),
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.fontWeight.bold,
    lineHeight: 1,
}));

const StyledOwnerBadge = styled(StyledBadge)(({ theme }) => ({
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.border}`,
    background: theme.palette.success.light,
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
            show={<StyledBadge>{capitalize(value)}</StyledBadge>}
            elseShow={<StyledOwnerBadge>{capitalize(value)}</StyledOwnerBadge>}
        />
    );

    return (
        <TextCell>
            <ConditionallyRender
                condition={Boolean(onChange)}
                show={
                    <Select
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
