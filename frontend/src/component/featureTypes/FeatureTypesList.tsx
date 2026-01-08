import { useMemo } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useSortBy, useTable } from "react-table";
import { sortTypes } from "utils/sortTypes";
import { PageContent } from "component/common/PageContent/PageContent";
import useFeatureTypes from "hooks/api/getters/useFeatureTypes/useFeatureTypes";
import { PageHeader } from "component/common/PageHeader/PageHeader";
import { Box } from "@mui/material";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    SortableTableHeader,
} from "component/common/Table";
import { TextCell } from "component/common/Table/cells/TextCell/TextCell";
import { getFeatureTypeIcons } from "utils/getFeatureTypeIcons";
import { IconCell } from "component/common/Table/cells/IconCell/IconCell";
import { ActionCell } from "component/common/Table/cells/ActionCell/ActionCell";
import PermissionIconButton from "component/common/PermissionIconButton/PermissionIconButton";
import { ADMIN } from "component/providers/AccessProvider/permissions";
import Edit from "@mui/icons-material/Edit";
import { SidebarModal } from "component/common/SidebarModal/SidebarModal";
import { FeatureTypeEdit } from "./FeatureTypeEdit/FeatureTypeEdit.tsx";
import { LinkCell } from "component/common/Table/cells/LinkCell/LinkCell";

const basePath = "/feature-toggle-type";

export const FeatureTypesList = () => {
    const { featureTypes, loading } = useFeatureTypes();
    const navigate = useNavigate();

    const columns = useMemo(
        () => [
            {
                accessor: "id",
                Cell: ({ value }: { value: string }) => {
                    const IconComponent = getFeatureTypeIcons(value);
                    return (
                        <IconCell
                            icon={
                                <IconComponent
                                    data-loading="true"
                                    color="action"
                                />
                            }
                        />
                    );
                },
                width: 50,
                disableSortBy: true,
            },
            {
                Header: "Name",
                accessor: "name",
                width: "90%",
                Cell: ({
                    row: {
                        original: { name, description },
                    },
                }: any) => {
                    return (
                        <LinkCell
                            data-loading
                            disableTooltip
                            title={name}
                            subtitle={description}
                        />
                    );
                },
                sortType: "alphanumeric",
            },
            {
                Header: "Lifetime",
                accessor: "lifetimeDays",
                Cell: ({ value }: { value: number }) => {
                    if (value) {
                        return (
                            <TextCell>
                                {value === 1 ? "1 day" : `${value} days`}
                            </TextCell>
                        );
                    }

                    return <TextCell>doesn't expire</TextCell>;
                },
                minWidth: 150,
                sortType: "numericZeroLast",
            },
            {
                Header: "Actions",
                Cell: ({ row: { original: featureType } }: any) => (
                    <Box sx={(theme) => ({ padding: theme.spacing(0.5, 0) })}>
                        <ActionCell>
                            <PermissionIconButton
                                disabled={!featureType.id}
                                data-loading="true"
                                onClick={() =>
                                    navigate(
                                        `/feature-toggle-type/edit/${featureType.id}`
                                    )
                                }
                                permission={ADMIN}
                                tooltipProps={{
                                    title: `Edit ${featureType.name} feature flag type`,
                                }}
                            >
                                <Edit />
                            </PermissionIconButton>
                        </ActionCell>
                    </Box>
                ),
                disableSortBy: true,
            },
        ],
        [navigate]
    );

    const data = useMemo(
        () =>
            loading
                ? Array(5).fill({
                      id: "",
                      name: "Loading...",
                      description: "Loading...",
                      lifetimeDays: 1,
                  })
                : featureTypes,
        [loading, featureTypes]
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable(
            {
                columns: columns as any[],
                data,
                sortTypes,
                autoResetSortBy: false,
                disableSortRemove: true,
                initialState: {
                    sortBy: [
                        {
                            id: "lifetimeDays",
                        },
                    ],
                },
            },
            useSortBy
        );

    console.log("rows", rows);
    return (
        <PageContent
            isLoading={loading}
            header={<PageHeader title="Feature flag types" />}
        >
            <Table {...getTableProps()}>
                <SortableTableHeader headerGroups={headerGroups} />
                <TableBody {...getTableBodyProps()}>
                    {rows.map((row) => {
                        prepareRow(row);
                        const { key, ...rowProps } = row.getRowProps();
                        return (
                            <TableRow hover key={key} {...rowProps}>
                                {row.cells.map((cell) => {
                                    const { key, ...cellProps } =
                                        cell.getCellProps();

                                    return (
                                        <TableCell key={key} {...cellProps}>
                                            {cell.render("Cell")}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <Routes>
                <Route
                    path="edit/:featureTypeId"
                    element={
                        <SidebarModal
                            label="Edit feature flag type"
                            onClose={() => navigate(basePath)}
                            open
                        >
                            <FeatureTypeEdit
                                featureTypes={featureTypes}
                                loading={loading}
                            />
                        </SidebarModal>
                    }
                />
            </Routes>
        </PageContent>
    );
};
