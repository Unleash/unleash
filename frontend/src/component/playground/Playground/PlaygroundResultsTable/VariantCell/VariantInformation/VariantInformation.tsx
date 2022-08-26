import { Typography, styled, useTheme } from '@mui/material';
import { Table, TableBody, TableCell, TableRow } from 'component/common/Table';
import { useMemo, VFC } from 'react';
import { IFeatureVariant } from 'interfaces/featureToggle';
import { calculateVariantWeight } from 'component/common/util';
import { useGlobalFilter, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { SortableTableHeader } from 'component/common/Table';
import { CheckCircleOutlined } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';

interface IVariantInformationProps {
    variants: IFeatureVariant[];
    selectedVariant: string;
}

const StyledBox = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
    maxWidth: '400px',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const StyledCheckIcon = styled(CheckCircleOutlined)(({ theme }) => ({
    color: theme.palette.success.main,
}));

export const VariantInformation: VFC<IVariantInformationProps> = ({
    variants,
    selectedVariant,
}) => {
    const theme = useTheme();
    const data = useMemo(() => {
        return variants.map(variant => {
            return {
                name: variant.name,
                weight: `${calculateVariantWeight(variant.weight)}%`,
                selected: variant.name === selectedVariant,
            };
        });
    }, [variants, selectedVariant]);

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'name', desc: false }],
        }),
        []
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable(
            {
                initialState,
                columns: COLUMNS as any,
                data: data as any,
                sortTypes,
                autoResetGlobalFilter: false,
                autoResetSortBy: false,
                disableSortRemove: true,
            },
            useGlobalFilter,
            useSortBy
        );

    return (
        <StyledBox>
            <StyledTypography variant="subtitle2">
                Variant Information
            </StyledTypography>

            <StyledTypography variant="body2">
                The following table shows the variants defined on this feature
                toggle and the variant result based on your context
                configuration.
            </StyledTypography>

            <StyledTypography variant="body2">
                If you include "userId" or "sessionId" in your context, the
                variant will be the same every time because unleash uses these
                properties to ensure that the user receives the same experience.
            </StyledTypography>

            <Table {...getTableProps()} rowHeight="dense">
                <SortableTableHeader headerGroups={headerGroups as any} />
                <TableBody {...getTableBodyProps()}>
                    {rows.map((row: any) => {
                        let styles = {} as { [key: string]: string };

                        if (!row.original.selected) {
                            styles.color = theme.palette.text.secondary;
                        }

                        prepareRow(row);
                        return (
                            <TableRow hover {...row.getRowProps()}>
                                {row.cells.map((cell: any) => (
                                    <TableCell
                                        {...cell.getCellProps()}
                                        style={styles}
                                    >
                                        {cell.render('Cell')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </StyledBox>
    );
};

const COLUMNS = [
    {
        id: 'Icon',
        Cell: ({
            row: {
                original: { selected },
            },
        }: any) => (
            <>
                <ConditionallyRender
                    condition={selected}
                    show={<IconCell icon={<StyledCheckIcon />} />}
                />
            </>
        ),
        maxWidth: 25,
        disableGlobalFilter: true,
    },
    {
        Header: 'Name',
        accessor: 'name',
        searchable: true,
        Cell: ({
            row: {
                original: { name },
            },
        }: any) => <TextCell>{name}</TextCell>,
        maxWidth: 175,
        width: 175,
    },
    {
        Header: 'Weight',
        accessor: 'weight',
        sortType: 'alphanumeric',
        searchable: true,
        maxWidth: 75,
        Cell: ({
            row: {
                original: { weight },
            },
        }: any) => <TextCell>{weight}</TextCell>,
    },
];
