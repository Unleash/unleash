import {ChangesetTable} from "../ChangesetTable/ChangesetTable";
import {createLocalStorage} from "../../../utils/createLocalStorage";
import {SortingRule} from "react-table";

export interface IChangeRequestsTab {
    projectId: string;
}

const defaultSort: SortingRule<string> = { id: 'id' };

export const ChangeRequestsTab = ({projectId}: IChangeRequestsTab) => {
    const changesets: any[] = [];

    const refetch = async () => Promise.resolve();

    const { value, setValue } = createLocalStorage(
        `${projectId}:ProjectFeaturesArchiveTable`,
        defaultSort
    );

    return (
        <ChangesetTable
            title={'Syggestions'}
            changesets={changesets}
            loading={true}
            refetch={refetch}
            storedParams={value}
            setStoredParams={setValue}
        />
    )
}
