import Check from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';

interface ICheckMarkBadgeProps {
    className: string;
    type?: string;
}

const CheckMarkBadge = ({ type }: ICheckMarkBadgeProps) => {
    return type === 'error' ? (
        <Cancel color='primary' titleAccess='Error' />
    ) : (
        <Check color='primary' />
    );
};

export default CheckMarkBadge;
