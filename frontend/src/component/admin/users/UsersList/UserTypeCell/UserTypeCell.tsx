import AttachMoneyRounded from '@mui/icons-material/AttachMoneyRounded';
import { styled, Tooltip } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';

const StyledMonetizationOn = styled(AttachMoneyRounded)(({ theme }) => ({
    color: theme.palette.primary.light,
    fontSize: '1.5rem',
    backgroundColor: '#F1F0FC',
    borderRadius: theme.shape.borderRadiusLarge,
}));

interface IUserTypeCellProps {
    value: boolean;
}

export const UserTypeCell = ({ value }: IUserTypeCellProps) => {
    return (
        <TextCell>
            {value ? (
                <Tooltip title='Paid user' arrow>
                    <StyledMonetizationOn />
                </Tooltip>
            ) : (
                'Included'
            )}
        </TextCell>
    );
};
