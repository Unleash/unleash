import { ArrowRight } from '@mui/icons-material';
import { useTheme } from '@mui/system';
import { TextCell } from '../../../common/Table/cells/TextCell/TextCell';

export const ChangesetActionCell = () => {
    const theme = useTheme();
    return (
        <TextCell sx={{ textAlign: 'right' }}>
            <ArrowRight sx={{ color: theme.palette.secondary.main }} />{' '}
        </TextCell>
    );
};
