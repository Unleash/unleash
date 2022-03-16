import { useContext, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@material-ui/core';
import AccessContext from 'contexts/AccessContext';
import usePagination from 'hooks/usePagination';
import {
    CREATE_SEGMENT,
    UPDATE_SEGMENT,
} from 'component/providers/AccessProvider/permissions';
import PaginateUI from 'component/common/PaginateUI/PaginateUI';
import { SegmentListItem } from './SegmentListItem/SegmentListItem';
import { ISegment } from 'interfaces/segment';
import { useStyles } from './SegmentList.styles';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { SegmentDeleteConfirm } from '../SegmentDeleteConfirm/SegmentDeleteConfirm';
import { useSegmentsApi } from 'hooks/api/actions/useSegmentsApi/useSegmentsApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/format-unknown-error';
import { Link, useHistory } from 'react-router-dom';
import ConditionallyRender from 'component/common/ConditionallyRender';
import HeaderTitle from 'component/common/HeaderTitle';
import PageContent from 'component/common/PageContent';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';

export const SegmentsList = () => {
    const history = useHistory();
    const { hasAccess } = useContext(AccessContext);
    const { segments, refetchSegments } = useSegments();
    const { deleteSegment } = useSegmentsApi();
    const { page, pages, nextPage, prevPage, setPageIndex, pageIndex } =
        usePagination(segments, 10);
    const [currentSegment, setCurrentSegment] = useState<ISegment>();
    const [delDialog, setDelDialog] = useState(false);
    const [confirmName, setConfirmName] = useState('');
    const { setToastData, setToastApiError } = useToast();

    const styles = useStyles();

    const onDeleteSegment = async () => {
        if (!currentSegment?.id) return;
        try {
            await deleteSegment(currentSegment?.id);
            refetchSegments();
            setToastData({
                type: 'success',
                title: 'Successfully deleted segment',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
        setDelDialog(false);
        setConfirmName('');
    };

    const renderSegments = () => {
        return page.map((segment: ISegment) => {
            return (
                <SegmentListItem
                    key={segment.id}
                    id={segment.id}
                    name={segment.name}
                    description={segment.description}
                    createdAt={segment.createdAt}
                    createdBy={segment.createdBy}
                    setCurrentSegment={setCurrentSegment}
                    setDelDialog={setDelDialog}
                />
            );
        });
    };

    const renderNoSegments = () => {
        return (
            <div className={styles.container}>
                <Typography className={styles.title}>
                    There are no segments created yet.
                </Typography>
                <p className={styles.subtitle}>
                    Segment makes it easy for you to define who should be
                    exposed to your feature. The segment is often a collection
                    of constraints and can be reused.
                </p>
                <Link to="/segments/create" className={styles.paramButton}>
                    Create your first segment
                </Link>
            </div>
        );
    };

    return (
        <PageContent
            headerContent={
                <HeaderTitle
                    title="Segments"
                    actions={
                        <PermissionButton
                            onClick={() => history.push('/segments/create')}
                            permission={CREATE_SEGMENT}
                        >
                            New Segment
                        </PermissionButton>
                    }
                />
            }
        >
            <div className={styles.main}>
                <Table>
                    <TableHead>
                        <TableRow className={styles.tableRow}>
                            <TableCell
                                className={styles.firstHeader}
                                classes={{ root: styles.cell }}
                            >
                                Name
                            </TableCell>
                            <TableCell
                                classes={{ root: styles.cell }}
                                className={styles.hideSM}
                            >
                                Description
                            </TableCell>
                            <TableCell
                                classes={{ root: styles.cell }}
                                className={styles.hideXS}
                            >
                                Created on
                            </TableCell>
                            <TableCell
                                classes={{ root: styles.cell }}
                                className={styles.hideXS}
                            >
                                Created By
                            </TableCell>
                            <TableCell
                                align="right"
                                classes={{ root: styles.cell }}
                                className={styles.lastHeader}
                            >
                                {hasAccess(UPDATE_SEGMENT) ? 'Actions' : ''}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <ConditionallyRender
                            condition={segments.length > 0}
                            show={renderSegments()}
                        />
                    </TableBody>

                    <PaginateUI
                        pages={pages}
                        pageIndex={pageIndex}
                        setPageIndex={setPageIndex}
                        nextPage={nextPage}
                        prevPage={prevPage}
                    />
                </Table>
                <ConditionallyRender
                    condition={segments.length === 0}
                    show={renderNoSegments()}
                />
                {currentSegment && (
                    <SegmentDeleteConfirm
                        segment={currentSegment}
                        open={delDialog}
                        setDeldialogue={setDelDialog}
                        handleDeleteSegment={onDeleteSegment}
                        confirmName={confirmName}
                        setConfirmName={setConfirmName}
                    />
                )}
            </div>
        </PageContent>
    );
};
