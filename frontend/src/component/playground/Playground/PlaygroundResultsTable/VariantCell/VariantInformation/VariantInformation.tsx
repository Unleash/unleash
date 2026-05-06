import { Typography, styled, useTheme } from '@mui/material';
import { Table, TableBody, TableCell, TableRow } from 'component/common/Table';
import { useMemo, type FC } from 'react';
import type { IFeatureVariant } from 'interfaces/featureToggle';
import { calculateVariantWeight } from 'component/common/util';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { SortableTableHeader } from 'component/common/Table/SortableTableHeader/SortableTableHeader';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';

interface IVariantInformationProps {
    variants: IFeatureVariant[];
    selectedVariant: string;
}

type VariantRow = {
    name: string;
    weight: string;
    selected: boolean;
};

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

const COLUMNS: ColumnDef<VariantRow, unknown>[] = [
    {
        id: 'Icon',
        cell: ({
            row: {
                original: { selected },
            },
        }) => (
            <ConditionallyRender
                condition={selected}
                show={<IconCell icon={<StyledCheckIcon />} />}
            />
        ),
        meta: { maxWidth: 25 },
    },
    {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        cell: ({
            row: {
                original: { name },
            },
        }) => <TextCell>{name}</TextCell>,
        meta: { maxWidth: 175, width: 175 },
    },
    {
        id: 'weight',
        header: 'Weight',
        accessorKey: 'weight',
        sortingFn: 'alphanumeric',
        cell: ({
            row: {
                original: { weight },
            },
        }) => <TextCell>{weight}</TextCell>,
        meta: { maxWidth: 75 },
    },
];

export const VariantInformation: FC<IVariantInformationProps> = ({
    variants,
    selectedVariant,
}) => {
    const theme = useTheme();
    const data = useMemo<VariantRow[]>(() => {
        return variants.map((variant) => ({
            name: variant.name,
            weight: `${calculateVariantWeight(variant.weight)}%`,
            selected: variant.name === selectedVariant,
        }));
    }, [variants, selectedVariant]);

    const table = useReactTable({
        columns: COLUMNS,
        data,
        initialState: {
            sorting: [{ id: 'name', desc: false }],
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    return (
        <StyledBox>
            <StyledTypography variant='subtitle2'>
                Variant Information
            </StyledTypography>

            <StyledTypography variant='body2'>
                The following table shows the variants defined on this feature
                toggle and the variant result based on your context
                configuration.
            </StyledTypography>

            <StyledTypography variant='body2'>
                If you include "userId" or "sessionId" in your context, the
                variant will be the same every time because unleash uses these
                properties to ensure that the user receives the same experience.
            </StyledTypography>

            <Table rowHeight='dense'>
                <SortableTableHeader tableInstance={table} />
                <TableBody>
                    {table.getRowModel().rows.map((row) => {
                        const styles = {} as { [key: string]: string };
                        if (!row.original.selected) {
                            styles.color = theme.palette.text.secondary;
                        }
                        return (
                            <TableRow hover key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} style={styles}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
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
