import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@material-ui/core';
import classnames from 'classnames';
import { useStyles } from './FeatureToggleListNew.styles';
import FeatureToggleListNewItem from './FeatureToggleListNewItem/FeatureToggleListNewItem';
import usePagination from '../../../hooks/usePagination';

import loadingFeatures from './FeatureToggleListNewItem/loadingFeatures';
import {
    IFeatureToggle,
    IFeatureToggleListItem,
} from '../../../interfaces/featureToggle';
import PaginateUI from '../../common/PaginateUI/PaginateUI';
import StringTruncator from '../../common/StringTruncator/StringTruncator';
interface IFeatureToggleListNewProps {
    features: IFeatureToggleListItem[];
    loading: boolean;
    projectId: string;
}

// @ts-expect-error
const sortList = (list, sortOpt) => {
    if (!list) {
        return list;
    }
    if (!sortOpt.field) {
        return list;
    }
    if (sortOpt.type === 'string') {
        // @ts-expect-error
        return list.sort((a, b) => {
            const fieldA = a[sortOpt.field]?.toUpperCase();
            const fieldB = b[sortOpt.field]?.toUpperCase();
            const direction = sortOpt.direction;

            if (fieldA < fieldB) {
                return direction === 0 ? -1 : 1;
            }
            if (fieldA > fieldB) {
                return direction === 0 ? 1 : -1;
            }
            return 0;
        });
    }
    if (sortOpt.type === 'date') {
        // @ts-expect-error
        return list.sort((a, b) => {
            const fieldA = new Date(a[sortOpt.field]);
            const fieldB = new Date(b[sortOpt.field]);

            if (fieldA < fieldB) {
                return sortOpt.direction === 0 ? 1 : -1;
            }
            if (fieldA > fieldB) {
                return sortOpt.direction === 0 ? -1 : 1;
            }
            return 0;
        });
    }
    return list;
};

const FeatureToggleListNew = ({
    features,
    loading,
    projectId,
}: IFeatureToggleListNewProps) => {
    const styles = useStyles();
    const [sortOpt, setSortOpt] = useState({
        field: 'name',
        type: 'string',
        direction: 0,
    });
    const [sortedFeatures, setSortedFeatures] = useState(
        sortList([...features], sortOpt)
    );

    const { page, pages, nextPage, prevPage, setPageIndex, pageIndex } =
        usePagination(sortedFeatures, 50);

    useEffect(() => {
        setSortedFeatures(sortList([...features], sortOpt));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [features]);

    const updateSort = (field: string) => {
        let newSortOpt;
        if (field === sortOpt.field) {
            newSortOpt = { ...sortOpt, direction: (sortOpt.direction + 1) % 2 };
        } else if (['createdAt', 'lastSeenAt'].includes(field)) {
            newSortOpt = {
                field,
                type: 'date',
                direction: 0,
            };
        } else {
            newSortOpt = {
                field,
                type: 'string',
                direction: 0,
            };
        }
        setSortOpt(newSortOpt);
        setSortedFeatures(sortList([...features], newSortOpt));
        setPageIndex(0);
    };

    const getEnvironments = () => {
        if (features.length > 0) {
            const envs = features[0].environments || [];
            return envs;
        }

        return [
            {
                name: 'default',
                enabled: false,
            },
        ];
    };

    const renderFeatures = () => {
        if (loading) {
            return loadingFeatures.map((feature: IFeatureToggleListItem) => {
                return (
                    <FeatureToggleListNewItem
                        key={feature.name}
                        name={feature.name}
                        type={feature.type}
                        environments={feature.environments}
                        projectId={projectId}
                        createdAt={new Date()}
                    />
                );
            });
        }

        return page.map((feature: IFeatureToggle) => {
            return (
                <FeatureToggleListNewItem
                    key={feature.name}
                    name={feature.name}
                    type={feature.type}
                    environments={feature.environments}
                    projectId={projectId}
                    lastSeenAt={feature.lastSeenAt}
                    createdAt={feature.createdAt}
                />
            );
        });
    };

    return (
        <>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell
                            className={classnames(
                                styles.tableCell,
                                styles.tableCellStatus,
                                styles.tableCellHeader,
                                styles.tableCellHeaderSortable
                            )}
                            align="left"
                        >
                            <span
                                data-loading
                                onClick={() => updateSort('lastSeenAt')}
                            >
                                Last use
                            </span>
                        </TableCell>
                        <TableCell
                            className={classnames(
                                styles.tableCell,
                                styles.tableCellType,
                                styles.tableCellHeader,
                                styles.tableCellHeaderSortable
                            )}
                            align="center"
                        >
                            <span
                                data-loading
                                onClick={() => updateSort('type')}
                            >
                                Type
                            </span>
                        </TableCell>
                        <TableCell
                            className={classnames(
                                styles.tableCell,
                                styles.tableCellName,
                                styles.tableCellHeader,
                                styles.tableCellHeaderSortable
                            )}
                            align="left"
                        >
                            <span
                                data-loading
                                onClick={() => updateSort('name')}
                            >
                                Name
                            </span>
                        </TableCell>
                        <TableCell
                            className={classnames(
                                styles.tableCell,
                                styles.tableCellCreated,
                                styles.tableCellHeader,
                                styles.tableCellHeaderSortable
                            )}
                            align="left"
                        >
                            <span
                                data-loading
                                onClick={() => updateSort('createdAt')}
                            >
                                Created
                            </span>
                        </TableCell>
                        {getEnvironments().map((env: any) => {
                            return (
                                <TableCell
                                    key={env.name}
                                    className={classnames(
                                        styles.tableCell,
                                        styles.tableCellEnv,
                                        styles.tableCellHeader,
                                        styles.tableCellHeaderSortable
                                    )}
                                    align="center"
                                >
                                    <StringTruncator
                                        text={env.name}
                                        maxWidth="90"
                                        data-loading
                                    />
                                </TableCell>
                            );
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>{renderFeatures()}</TableBody>
            </Table>
            <PaginateUI
                pages={pages}
                pageIndex={pageIndex}
                setPageIndex={setPageIndex}
                nextPage={nextPage}
                prevPage={prevPage}
            />
        </>
    );
};

export default FeatureToggleListNew;
