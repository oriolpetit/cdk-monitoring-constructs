import { DimensionHash } from "monocdk/aws-cloudwatch";

import { MetricFactory, MetricStatistic } from "../../common";

export interface KinesisDataAnalyticsMetricFactoryProps {
  readonly application: string;
}

/**
 * Used internally by this class to ease generating metrics
 */
interface MetricsSpec {
  readonly name: string;
  readonly description: string;
  readonly metricStatistic?: MetricStatistic;
}

/**
 * @see https://docs.aws.amazon.com/kinesisanalytics/latest/java/metrics-dimensions.html
 */
export class KinesisDataAnalyticsMetricFactory {
  protected readonly metricFactory: MetricFactory;
  protected readonly dimensions: DimensionHash;

  constructor(
    metricFactory: MetricFactory,
    props: KinesisDataAnalyticsMetricFactoryProps
  ) {
    this.metricFactory = metricFactory;
    this.dimensions = {
      Application: props.application,
    };
  }

  metricKPUsCount() {
    return this.generateMetric({
      name: "KPUs",
      description: "Kinesis Processing Units",
    });
  }

  metricDowntimeMs() {
    return this.generateMetric({
      name: "downtime",
      description: "Downtime",
    });
  }

  metricUptimeMs() {
    return this.generateMetric({
      name: "uptime",
      description: "Uptime",
    });
  }

  metricFullRestartsCount() {
    return this.generateMetric({
      name: "fullRestarts",
      description: "Restarts",
    });
  }

  metricNumberOfFailedCheckpointsCount() {
    return this.generateMetric({
      name: "numberOfFailedCheckpoints",
      description: "Failed Checkpoints",
      metricStatistic: MetricStatistic.SUM,
    });
  }

  metricLastCheckpointDurationMs() {
    return this.generateMetric({
      name: "lastCheckpointDuration",
      description: "Last Checkpoint Duration",
    });
  }

  metricLastCheckpointSizeBytes() {
    return this.generateMetric({
      name: "lastCheckpointSize",
      description: "Last Checkpoint Size",
      metricStatistic: MetricStatistic.SUM,
    });
  }

  metricCpuUtilizationPercent() {
    return this.generateMetric({
      name: "cpuUtilization",
      description: "CPU Utilization",
    });
  }

  metricHeapMemoryUtilizationPercent() {
    return this.generateMetric({
      name: "heapMemoryUtilization",
      description: "Heap Memory Utilization",
    });
  }

  metricOldGenerationGCTimeMs() {
    return this.generateMetric({
      name: "oldGenerationGCTime",
      description: "GC Time",
    });
  }

  metricOldGenerationGCCount() {
    return this.generateMetric({
      name: "oldGenerationGCCount",
      metricStatistic: MetricStatistic.N,
      description: "GC Count",
    });
  }

  private generateMetric(metricsSpec: MetricsSpec) {
    return this.metricFactory.createMetric(
      metricsSpec.name,
      metricsSpec.metricStatistic || MetricStatistic.AVERAGE,
      metricsSpec.description,
      this.dimensions,
      undefined, // the hex color code of the metric on a graph
      "AWS/KinesisAnalytics"
    );
  }
}
