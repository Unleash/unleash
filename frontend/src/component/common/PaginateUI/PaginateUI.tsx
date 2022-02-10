import { useState, useEffect } from 'react';
import ConditionallyRender from '../ConditionallyRender';
import classnames from 'classnames';
import { useStyles } from './PaginationUI.styles';

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import { useMediaQuery, useTheme } from '@material-ui/core';

interface IPaginateUIProps {
    pages: any[];
    pageIndex: number;
    prevPage: () => void;
    setPageIndex: (idx: number) => void;
    nextPage: () => void;
    style?: React.CSSProperties;
}

const PaginateUI = ({
    pages,
    pageIndex,
    prevPage,
    setPageIndex,
    nextPage,
    ...rest
}: IPaginateUIProps) => {
    const STARTLIMIT = 6;
    const theme = useTheme();
    const styles = useStyles();
    const [limit, setLimit] = useState(STARTLIMIT);
    const [start, setStart] = useState(0);
    const matches = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (matches) {
            setLimit(4);
        }
    }, [matches]);

    useEffect(() => {
        if (pageIndex === 0 && start !== 0) {
            setStart(0);
            setLimit(STARTLIMIT);
        }
    }, [pageIndex, start]);

    return (
        <ConditionallyRender
            condition={pages.length > 1}
            show={
                <div className={styles.pagination} {...rest}>
                    <div className={styles.paginationInnerContainer}>
                        <ConditionallyRender
                            condition={pageIndex > 0}
                            show={
                                <>
                                    <button
                                        className={classnames(
                                            styles.idxBtn,
                                            styles.idxBtnLeft
                                        )}
                                        onClick={() => {
                                            prevPage();
                                            if (start > 0) {
                                                setLimit(prev => prev - 1);
                                                setStart(prev => prev - 1);
                                            }
                                        }}
                                    >
                                        <ArrowBackIosIcon
                                            className={styles.idxBtnIcon}
                                        />
                                    </button>
                                    <button
                                        className={classnames(
                                            styles.idxBtn,
                                            styles.doubleArrowBtnLeft
                                        )}
                                        onClick={() => {
                                            setPageIndex(0);
                                            if (start > 0) {
                                                setLimit(STARTLIMIT);
                                                setStart(0);
                                            }
                                        }}
                                    >
                                        <DoubleArrowIcon
                                            className={classnames(
                                                styles.arrowIcon,
                                                styles.arrowIconLeft
                                            )}
                                        />
                                    </button>
                                </>
                            }
                        />

                        {pages
                            .map((page, idx) => {
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
                                        onClick={() => {
                                            setPageIndex(idx);
                                        }}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })
                            .slice(start, limit)}
                        <ConditionallyRender
                            condition={pageIndex < pages.length - 1}
                            show={
                                <>
                                    <button
                                        onClick={() => {
                                            nextPage();
                                            if (limit < pages.length) {
                                                setLimit(prev => prev + 1);
                                                setStart(prev => prev + 1);
                                            }
                                        }}
                                        className={classnames(
                                            styles.idxBtn,
                                            styles.idxBtnRight
                                        )}
                                    >
                                        <ArrowForwardIosIcon
                                            className={styles.idxBtnIcon}
                                        />
                                    </button>
                                    <button
                                        className={classnames(
                                            styles.idxBtn,
                                            styles.doubleArrowBtnRight
                                        )}
                                        onClick={() => {
                                            setPageIndex(pages.length - 1);
                                            setLimit(pages.length);
                                            setStart(pages.length - STARTLIMIT);
                                        }}
                                    >
                                        <DoubleArrowIcon
                                            className={styles.arrowIcon}
                                        />
                                    </button>
                                </>
                            }
                        />
                    </div>
                </div>
            }
        />
    );
};

export default PaginateUI;
