import type { ChartTypeRegistry, ChartData as ChartJsData } from 'chart.js';

export type ChartData<
    T,
    TPlaceholder = T,
    TChartType extends keyof ChartTypeRegistry = any,
> =
    | { state: 'Loading'; value: ChartJsData<TChartType, TPlaceholder[]> }
    | {
          state: 'Not Enough Data';
          value: ChartJsData<TChartType, TPlaceholder[]>;
      }
    | { state: 'Weekly'; value: ChartJsData<TChartType, T[]> }
    | {
          state: 'Batched';
          batchSize: number;
          value: ChartJsData<TChartType, T[]>;
      };

export const hasRealData = <
    T,
    TPlaceholder = T,
    TChartType extends keyof ChartTypeRegistry = any,
>(
    chartDataStatus: ChartData<T, TPlaceholder, TChartType>,
): chartDataStatus is
    | { state: 'Weekly'; value: ChartJsData<TChartType, T[]> }
    | {
          state: 'Batched';
          batchSize: number;
          value: ChartJsData<TChartType, T[]>;
      } =>
    chartDataStatus.state === 'Weekly' || chartDataStatus.state === 'Batched';
