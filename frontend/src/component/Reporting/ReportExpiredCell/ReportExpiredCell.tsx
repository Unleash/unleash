import { VFC } from 'react';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { IReportTableRow } from 'component/Reporting/ReportTable/ReportTable';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';

interface IReportExpiredCellProps {
    row: {
        original: IReportTableRow;
    };
}

export const ReportExpiredCell: VFC<IReportExpiredCellProps> = ({ row }) => {
    if (row.original.expiredAt) {
        return <DateCell value={row.original.expiredAt} />;
    }

    return <TextCell>N/A</TextCell>;
};
