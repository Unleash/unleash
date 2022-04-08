import { useStyles } from './SegmentListItem.styles';
import { TableCell, TableRow, Typography } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import {
    ADMIN,
    UPDATE_SEGMENT,
} from 'component/providers/AccessProvider/permissions';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import TimeAgo from 'react-timeago';
import { ISegment } from 'interfaces/segment';
import { useHistory } from 'react-router-dom';
import { SEGMENT_DELETE_BTN_ID } from 'utils/testIds';

interface ISegmentListItemProps {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    createdBy: string;
    setCurrentSegment: React.Dispatch<
        React.SetStateAction<ISegment | undefined>
    >;
    setDelDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SegmentListItem = ({
    id,
    name,
    description,
    createdAt,
    createdBy,
    setCurrentSegment,
    setDelDialog,
}: ISegmentListItemProps) => {
    const styles = useStyles();
    const { push } = useHistory();

    return (
        <TableRow className={styles.tableRow}>
            <TableCell className={styles.leftTableCell}>
                <Typography variant="body2" data-loading>
                    {name}
                </Typography>
            </TableCell>
            <TableCell className={styles.descriptionCell}>
                <Typography variant="body2" data-loading>
                    {description}
                </Typography>
            </TableCell>
            <TableCell className={styles.createdAtCell}>
                <Typography variant="body2" data-loading>
                    <TimeAgo date={createdAt} live={false} />
                </Typography>
            </TableCell>
            <TableCell className={styles.createdAtCell}>
                <Typography variant="body2" data-loading>
                    {createdBy}
                </Typography>
            </TableCell>

            <TableCell align="right">
                <PermissionIconButton
                    data-loading
                    onClick={() => {
                        push(`/segments/edit/${id}`);
                    }}
                    permission={UPDATE_SEGMENT}
                >
                    <Edit titleAccess="Edit segment" />
                </PermissionIconButton>
                <PermissionIconButton
                    data-loading
                    aria-label="Remove segment"
                    onClick={() => {
                        setCurrentSegment({
                            id,
                            name,
                            description,
                            createdAt,
                            createdBy,
                            constraints: [],
                        });
                        setDelDialog(true);
                    }}
                    permission={ADMIN}
                    data-testid={`${SEGMENT_DELETE_BTN_ID}_${name}`}
                >
                    <Delete />
                </PermissionIconButton>
            </TableCell>
        </TableRow>
    );
};
