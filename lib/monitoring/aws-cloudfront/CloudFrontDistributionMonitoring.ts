import {
  GraphWidget,
  HorizontalAnnotation,
  IWidget,
} from "monocdk/aws-cloudwatch";

import {
  AlarmFactory,
  BaseMonitoringProps,
  CountAxisFromZero,
  DefaultGraphWidgetHeight,
  DefaultSummaryWidgetHeight,
  ErrorAlarmFactory,
  ErrorRateThreshold,
  ErrorType,
  HalfWidth,
  HighTpsThreshold,
  LowTpsThreshold,
  MetricWithAlarmSupport,
  Monitoring,
  MonitoringScope,
  PercentageAxisFromZeroToHundred,
  QuarterWidth,
  SizeAxisBytesFromZero,
  TpsAlarmFactory,
} from "../../common";
import {
  MonitoringHeaderWidget,
  MonitoringNamingStrategy,
} from "../../dashboard";
import {
  CloudFrontDistributionMetricFactory,
  CloudFrontDistributionMetricFactoryProps,
} from "./CloudFrontDistributionMetricFactory";

export interface CloudFrontDistributionMonitoringOptions
  extends BaseMonitoringProps {
  readonly addLowTpsAlarm?: Record<string, LowTpsThreshold>;
  readonly addHighTpsAlarm?: Record<string, HighTpsThreshold>;
  readonly addError4xxRate?: Record<string, ErrorRateThreshold>;
  readonly addError5xxRate?: Record<string, ErrorRateThreshold>;
}

export interface CloudFrontDistributionMonitoringProps
  extends CloudFrontDistributionMetricFactoryProps,
    CloudFrontDistributionMonitoringOptions {
  // empty
}

export class CloudFrontDistributionMonitoring extends Monitoring {
  private readonly title: string;
  private readonly distributionUrl?: string;

  protected readonly namingStrategy: MonitoringNamingStrategy;
  protected readonly alarmFactory: AlarmFactory;
  protected readonly errorAlarmFactory: ErrorAlarmFactory;
  protected readonly tpsAlarmFactory: TpsAlarmFactory;

  protected readonly errorRateAnnotations: HorizontalAnnotation[];
  protected readonly tpsAnnotations: HorizontalAnnotation[];

  protected readonly tpsMetric: MetricWithAlarmSupport;
  protected readonly downloadedBytesMetric: MetricWithAlarmSupport;
  protected readonly uploadedBytesMetric: MetricWithAlarmSupport;
  protected readonly cacheHitRate: MetricWithAlarmSupport;
  protected readonly error4xxRate: MetricWithAlarmSupport;
  protected readonly error5xxRate: MetricWithAlarmSupport;

  constructor(
    scope: MonitoringScope,
    props: CloudFrontDistributionMonitoringProps
  ) {
    super(scope);

    const namedConstruct = props.distribution;
    const fallbackConstructName = namedConstruct.distributionId;

    this.namingStrategy = new MonitoringNamingStrategy({
      ...props,
      namedConstruct,
      fallbackConstructName,
    });
    this.title = this.namingStrategy.resolveHumanReadableName();
    this.distributionUrl = scope
      .createAwsConsoleUrlFactory()
      .getCloudFrontDistributionUrl(namedConstruct.distributionId);

    this.alarmFactory = this.createAlarmFactory(
      this.namingStrategy.resolveAlarmFriendlyName()
    );
    this.errorAlarmFactory = new ErrorAlarmFactory(this.alarmFactory);
    this.tpsAlarmFactory = new TpsAlarmFactory(this.alarmFactory);

    this.errorRateAnnotations = [];
    this.tpsAnnotations = [];

    const metricFactory = new CloudFrontDistributionMetricFactory(
      scope.createMetricFactory(),
      props
    );
    this.tpsMetric = metricFactory.metricRequestTps();
    this.downloadedBytesMetric = metricFactory.metricTotalBytesDownloaded();
    this.uploadedBytesMetric = metricFactory.metricTotalBytesUploaded();
    this.cacheHitRate = metricFactory.metricCacheHitRateAverageInPercent();
    this.error4xxRate = metricFactory.metric4xxErrorRateAverage();
    this.error5xxRate = metricFactory.metric5xxErrorRateAverage();

    for (const disambiguator in props.addLowTpsAlarm) {
      const alarmProps = props.addLowTpsAlarm[disambiguator];
      const createdAlarm = this.tpsAlarmFactory.addMinTpsAlarm(
        this.tpsMetric,
        alarmProps,
        disambiguator
      );
      this.tpsAnnotations.push(createdAlarm.annotation);
      this.addAlarm(createdAlarm);
    }
    for (const disambiguator in props.addHighTpsAlarm) {
      const alarmProps = props.addHighTpsAlarm[disambiguator];
      const createdAlarm = this.tpsAlarmFactory.addMaxTpsAlarm(
        this.tpsMetric,
        alarmProps,
        disambiguator
      );
      this.tpsAnnotations.push(createdAlarm.annotation);
      this.addAlarm(createdAlarm);
    }
    for (const disambiguator in props.addError4xxRate) {
      const alarmProps = props.addError4xxRate[disambiguator];
      const createdAlarm = this.errorAlarmFactory.addErrorRateAlarm(
        this.error4xxRate,
        ErrorType.ERROR,
        alarmProps,
        disambiguator
      );
      this.errorRateAnnotations.push(createdAlarm.annotation);
      this.addAlarm(createdAlarm);
    }
    for (const disambiguator in props.addError5xxRate) {
      const alarmProps = props.addError5xxRate[disambiguator];
      const createdAlarm = this.errorAlarmFactory.addErrorRateAlarm(
        this.error5xxRate,
        ErrorType.FAULT,
        alarmProps,
        disambiguator
      );
      this.errorRateAnnotations.push(createdAlarm.annotation);
      this.addAlarm(createdAlarm);
    }

    props.useCreatedAlarms?.consume(this.createdAlarms());
  }

  summaryWidgets(): IWidget[] {
    return [
      this.createTitleWidget(),
      this.createTpsWidget(HalfWidth, DefaultSummaryWidgetHeight),
      this.createErrorRateWidget(HalfWidth, DefaultSummaryWidgetHeight),
    ];
  }

  widgets(): IWidget[] {
    return [
      this.createTitleWidget(),
      this.createTpsWidget(QuarterWidth, DefaultGraphWidgetHeight),
      this.createCacheWidget(QuarterWidth, DefaultGraphWidgetHeight),
      this.createTrafficWidget(QuarterWidth, DefaultGraphWidgetHeight),
      this.createErrorRateWidget(QuarterWidth, DefaultGraphWidgetHeight),
    ];
  }

  protected createTitleWidget() {
    return new MonitoringHeaderWidget({
      family: "CloudFront Distribution",
      title: this.title,
      goToLinkUrl: this.distributionUrl,
    });
  }

  protected createTpsWidget(width: number, height: number) {
    return new GraphWidget({
      width,
      height,
      title: "TPS",
      left: [this.tpsMetric],
      leftYAxis: CountAxisFromZero,
    });
  }

  protected createCacheWidget(width: number, height: number) {
    return new GraphWidget({
      width,
      height,
      title: "Hit Rate",
      left: [this.cacheHitRate],
      leftYAxis: PercentageAxisFromZeroToHundred,
    });
  }

  protected createTrafficWidget(width: number, height: number) {
    return new GraphWidget({
      width,
      height,
      title: "Traffic",
      left: [this.downloadedBytesMetric, this.uploadedBytesMetric],
      leftYAxis: SizeAxisBytesFromZero,
    });
  }

  protected createErrorRateWidget(width: number, height: number) {
    return new GraphWidget({
      width,
      height,
      title: "Errors (rate)",
      left: [this.error4xxRate, this.error5xxRate],
    });
  }
}
