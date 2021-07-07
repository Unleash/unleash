import ConditionallyRender from '../ConditionallyRender';
import classnames from 'classnames';
import { useStyles } from './PaginationUI.styles';

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

interface IPaginateUIProps {
    pages: any[];
    pageIndex: number;
    prevPage: () => void;
    setPageIndex: (idx: number) => void;
    nextPage: () => void;
}

const PaginateUI = ({
    pages,
    pageIndex,
    prevPage,
    setPageIndex,
    nextPage,
}: IPaginateUIProps) => {
    const styles = useStyles();

    return (
        <ConditionallyRender
            condition={pages.length > 1}
            show={
                <div className={styles.pagination}>
                    <div className={styles.paginationInnerContainer}>
                        <ConditionallyRender
                            condition={pageIndex > 0}
                            show={
                                <button
                                    className={classnames(
                                        styles.idxBtn,
                                        styles.idxBtnLeft
                                    )}
                                    onClick={() => prevPage()}
                                >
                                    <ArrowBackIosIcon
                                        className={styles.idxBtnIcon}
                                    />
                                </button>
                            }
                        />
                        {pages.map((page, idx) => {
                            const active = pageIndex === idx;
                            return (
                                <button
                                    key={idx}
                                    className={classnames(
                                        styles.paginationButton,
                                        {
                                            [styles.paginationButtonActive]:
                                                active,
                                        }
                                    )}
                                    onClick={() => setPageIndex(idx)}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                        <ConditionallyRender
                            condition={pageIndex < pages.length - 1}
                            show={
                                <button
                                    onClick={() => nextPage()}
                                    className={classnames(
                                        styles.idxBtn,
                                        styles.idxBtnRight
                                    )}
                                >
                                    <ArrowForwardIosIcon
                                        className={styles.idxBtnIcon}
                                    />
                                </button>
                            }
                        />
                    </div>
                </div>
            }
        />
    );
};

export default PaginateUI;
