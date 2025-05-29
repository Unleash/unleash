import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import {
    type IMetricsCount,
    useMetricCounters,
} from 'hooks/api/getters/useMetricCounters/useMetricCounters';
import { usePageTitle } from 'hooks/usePageTitle';
import { useEffect, useMemo, useState } from 'react';
import { ExploreCounterFilter } from './ExploreCounterFilter.js';
import { ExploreCounterChart } from './ExploreCounterChart.js';

const mapCounterNames = (metrics: IMetricsCount[]) => {
    return metrics.reduce((acc, metric) => {
        if (!acc.includes(metric.name)) {
            acc.push(metric.name);
        }
        return acc;
    }, [] as string[]);
};

const mapLabels = (metrics: IMetricsCount[]) => {
    return metrics.reduce(
        (acc, metric) => {
            for (const [key, value] of Object.entries(metric.labels)) {
                if (!acc[key]) {
                    acc[key] = [];
                }
                if (!acc[key].includes(value)) {
                    acc[key].push(value);
                }
            }
            return acc;
        },
        {} as Record<string, string[]>,
    );
};

export const ExploreCounters = () => {
    usePageTitle('Explore custom metrics');
    const data = useMetricCounters();
    const [counter, setCounter] = useState<string | undefined>(undefined);
    const [counterNames, setCounterNames] = useState<string[] | undefined>(
        undefined,
    );
    const [labels, setLabels] = useState<Record<string, string[]> | undefined>(
        undefined,
    );
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [selectedLabelValues, setSelectedLabelValues] = useState<string[]>(
        [],
    );
    const filteredCounters = useMemo(() => {
        return data?.counters?.metrics?.filter((metric) => {
            if (counter && metric.name !== counter) {
                return false;
            }
            if (selectedLabels.length > 0) {
                const labels = Object.keys(metric.labels);
                return selectedLabels.every(
                    (label) =>
                        labels.includes(label) &&
                        (selectedLabelValues.length === 0 ||
                            selectedLabelValues.includes(
                                `${label}::${metric.labels[label]}`,
                            )),
                );
            }
            return false;
        });
    }, [data, counter, selectedLabels, selectedLabelValues]);

    useEffect(() => {
        setCounterNames(mapCounterNames(data.counters.metrics));
        const labelMetrics = data.counters.metrics.filter((metric) => {
            return counter && metric.name === counter;
        });
        const counterLabels = mapLabels(labelMetrics);
        setLabels(counterLabels);
    }, [data.counters, filteredCounters, counter]);

    const selectLabel = (label: string) => {
        setSelectedLabels((prev) => {
            if (prev.includes(label)) {
                return prev.filter((l) => l !== label);
            }
            return [...prev, label];
        });
    };
    const unselectLabel = (label: string) => {
        setSelectedLabels((prev) => {
            return prev.filter((l) => l !== label);
        });
    };
    const selectLabelValue = (label: string) => {
        setSelectedLabelValues((prev) => {
            if (prev.includes(label)) {
                return prev.filter((l) => l !== label);
            }
            return [...prev, label];
        });
    };
    const unselectLabelValue = (label: string) => {
        setSelectedLabelValues((prev) => {
            return prev.filter((l) => l !== label);
        });
    };

    return (
        <>
            <PageContent
                header={<PageHeader title={`Explore custom metrics`} />}
            >
                <ExploreCounterFilter
                    selectLabel={selectLabel}
                    unselectLabel={unselectLabel}
                    selectLabelValue={selectLabelValue}
                    unselectLabelValue={unselectLabelValue}
                    counter={counter}
                    setCounter={setCounter}
                    counterNames={counterNames}
                    labels={labels}
                />
                {counter &&
                    selectedLabels.length > 0 &&
                    filteredCounters.length > 0 && (
                        <ExploreCounterChart
                            selectedLabels={selectedLabels}
                            selectedLabelValues={selectedLabelValues}
                            filteredCounters={filteredCounters}
                            counter={counter}
                            setCounter={setCounter}
                        />
                    )}
            </PageContent>
        </>
    );
};
