import { IFunction } from "monocdk/aws-lambda";

import { MetricFactory, MetricStatistic } from "../../common";

const LambdaInsightsNamespace = "LambdaInsights";

export class LambdaFunctionEnhancedMetricFactory {
  protected readonly metricFactory: MetricFactory;
  protected readonly lambdaFunction: IFunction;

  constructor(metricFactory: MetricFactory, lambdaFunction: IFunction) {
    this.metricFactory = metricFactory;
    this.lambdaFunction = lambdaFunction;
  }

  enhancedMetricMaxCpuTotalTime() {
    return this.enhancedMetric(
      "cpu_total_time",
      MetricStatistic.MAX,
      "CPUTotalTime.Max"
    );
  }

  enhancedMetricP90CpuTotalTime() {
    return this.enhancedMetric(
      "cpu_total_time",
      MetricStatistic.P90,
      "CPUTotalTime.P90"
    );
  }

  enhancedMetricAvgCpuTotalTime() {
    return this.enhancedMetric(
      "cpu_total_time",
      MetricStatistic.AVERAGE,
      "CPUTotalTime.Avg"
    );
  }

  enhancedMetricMaxMemoryUtilization() {
    return this.enhancedMetric(
      "memory_utilization",
      MetricStatistic.MAX,
      "MemoryUtilization.Max"
    );
  }

  enhancedMetricP90MemoryUtilization() {
    return this.enhancedMetric(
      "memory_utilization",
      MetricStatistic.P90,
      "MemoryUtilization.P90"
    );
  }

  enhancedMetricAvgMemoryUtilization() {
    return this.enhancedMetric(
      "memory_utilization",
      MetricStatistic.AVERAGE,
      "MemoryUtilization.Avg"
    );
  }

  enhancedMetricFunctionCost() {
    return this.metricFactory.createMetricMath(
      "memory_utilization * duration",
      {
        memory_utilization: this.enhancedMetricMaxMemoryUtilization(),
        duration: this.enhancedMetricFunctionDuration(),
      },
      "Function Cost (avg: ${AVG}, max: ${MAX})"
    );
  }

  private enhancedMetricFunctionDuration() {
    return this.lambdaFunction.metricDuration({
      statistic: MetricStatistic.SUM,
    });
  }

  private enhancedMetric(
    metricName: string,
    statistic: MetricStatistic,
    label: string,
    color?: string
  ) {
    const [functionName, functionVersion] =
      this.lambdaFunction.functionName.split(":");
    return this.metricFactory.createMetric(
      metricName,
      statistic,
      label,
      {
        function_name: functionName,
        version: functionVersion,
      },
      color,
      LambdaInsightsNamespace
    );
  }
}
