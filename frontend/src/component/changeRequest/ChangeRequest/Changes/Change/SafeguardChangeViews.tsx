import type { FC, ReactNode } from 'react';
import { styled } from '@mui/material';
import {
    isClosed,
    type ChangeRequestState,
} from 'component/changeRequest/changeRequest.types';
import type { CreateSafeguardSchema } from 'openapi';
import type { ISafeguard } from 'interfaces/safeguard';
import type { SafeguardType } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/SafeguardForm/SafeguardForm';
import { EventDiff } from 'component/events/EventDiff/EventDiff';
import { SafeguardForm } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/SafeguardForm/SafeguardForm';
import { ReadonlySafeguardDisplay } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/SafeguardForm/ReadonlySafeguardDisplay';
import { Tab, TabList, TabPanel, Tabs } from './ChangeTabComponents.tsx';
import {
    Added,
    ChangeItemInfo,
    ChangeItemWrapper,
    Deleted,
} from './Change.styles.tsx';
import { omitIfDefined } from 'utils/omitFields';

const StyledTabs = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(1),
}));

export const SafeguardChangeView: FC<{
    safeguard: ISafeguard;
    currentSafeguard?: ISafeguard;
    changeRequestState: ChangeRequestState;
    environmentName: string;
    featureName: string;
    safeguardType?: SafeguardType;
    actions?: ReactNode;
    onSubmit: (data: CreateSafeguardSchema) => void;
    onDelete: (safeguardId: string) => void;
}> = ({
    safeguard,
    currentSafeguard,
    changeRequestState,
    environmentName,
    featureName,
    safeguardType,
    actions,
    onSubmit,
    onDelete,
}) => {
    const readonly = isClosed(changeRequestState);

    return (
        <StyledTabs>
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <Added>Change safeguard</Added>
                </ChangeItemInfo>
                <div>
                    <TabList>
                        <Tab>View change</Tab>
                        <Tab>View diff</Tab>
                    </TabList>
                    {actions}
                </div>
            </ChangeItemWrapper>
            <TabPanel>
                {readonly ? (
                    <ReadonlySafeguardDisplay
                        safeguard={safeguard}
                        safeguardType={safeguardType}
                    />
                ) : (
                    <SafeguardForm
                        onSubmit={onSubmit}
                        onDelete={
                            currentSafeguard?.id
                                ? () => onDelete(currentSafeguard.id)
                                : undefined
                        }
                        safeguard={safeguard}
                        environment={environmentName}
                        featureId={featureName}
                        safeguardType={safeguardType}
                    />
                )}
            </TabPanel>
            <TabPanel variant='diff'>
                <EventDiff
                    entry={{
                        preData: omitIfDefined(currentSafeguard, [
                            'id',
                            'action',
                            'impactMetric.id',
                        ]),
                        data: safeguard,
                    }}
                />
            </TabPanel>
        </StyledTabs>
    );
};

export const SafeguardDeleteView: FC<{
    safeguard: ISafeguard;
    changeRequestState: ChangeRequestState;
    environmentName: string;
    featureName: string;
    safeguardType?: SafeguardType;
    actions?: ReactNode;
    onSubmit: (data: CreateSafeguardSchema) => void;
    onDelete: (safeguardId: string) => void;
}> = ({
    safeguard,
    changeRequestState,
    environmentName,
    featureName,
    safeguardType,
    actions,
    onSubmit,
    onDelete,
}) => {
    const readonly = isClosed(changeRequestState);

    return (
        <StyledTabs>
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <Deleted>Delete safeguard</Deleted>
                </ChangeItemInfo>
                <div>
                    <TabList>
                        <Tab>View change</Tab>
                        <Tab>View diff</Tab>
                    </TabList>
                    {actions}
                </div>
            </ChangeItemWrapper>
            <TabPanel>
                {readonly ? (
                    <ReadonlySafeguardDisplay
                        safeguard={safeguard}
                        safeguardType={safeguardType}
                    />
                ) : (
                    <SafeguardForm
                        onSubmit={onSubmit}
                        onDelete={
                            safeguard?.id
                                ? () => onDelete(safeguard.id)
                                : undefined
                        }
                        safeguard={safeguard}
                        environment={environmentName}
                        featureId={featureName}
                        safeguardType={safeguardType}
                    />
                )}
            </TabPanel>
            <TabPanel variant='diff'>
                <EventDiff
                    entry={{
                        preData: safeguard,
                        data: {},
                    }}
                />
            </TabPanel>
        </StyledTabs>
    );
};
