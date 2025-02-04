import { Duration } from "monocdk";
import { ComparisonOperator, TreatMissingData } from "monocdk/aws-cloudwatch";

import { IAlarmActionStrategy } from "./IAlarmActionStrategy";

/**
 * Common customization that can be attached to each alarm.
 */
export interface CustomAlarmThreshold {
  /**
   * Allows to override the default alarm action.
   *
   * @default undefined (default action will be used, if any)
   */
  readonly actionOverride?: IAlarmActionStrategy;
  /**
   * If this is defined, the alarm dedupe string is set to this exact value.
   * Please be aware that you need to handle deduping for different stages (Beta, Prod...) and realms (EU, NA...) manually.
   * Dedupe strings are global and not unique per CTI.
   *
   * @default undefined (no override)
   */
  readonly dedupeStringOverride?: string;
  /**
   * If this is defined, the alarm name is set to this exact value.
   * Please be aware that you need to specify prefix for different stages (Beta, Prod...) and realms (EU, NA...) manually.
   */
  readonly alarmNameOverride?: string;
  /**
   * A text included in the generated ticket description body, which fully replaces the generated text.
   *
   * @default default auto-generated content only
   */
  readonly alarmDescriptionOverride?: string;
  /**
   * This allows user to attach custom values to this alarm, which can later be accessed from the "useCreatedAlarms" method.
   *
   * @default no tags
   */
  readonly customTags?: string[];
  /**
   * This allows user to attach custom parameters to this alarm, which can later be accessed from the "useCreatedAlarms" method.
   *
   * @default no parameters
   */
  readonly customParams?: Record<string, any>;
  /**
   * Comparison operator used to compare actual value against the threshold.
   *
   * @default alarm-specific default
   */
  readonly comparisonOperatorOverride?: ComparisonOperator;
  /**
   * Behaviour in case the metric data is missing.
   *
   * @default alarm-specific default
   */
  readonly treatMissingDataOverride?: TreatMissingData;
  /**
   * Used only for alarms based on percentiles.
   * If you specify <code>false</code>, the alarm state does not change during periods with too few data points to be statistically significant.
   * If you specify <code>true</code>, the alarm is always evaluated and possibly changes state no matter how many data points are available.
   *
   * @default true
   */
  readonly evaluateLowSampleCountPercentile?: boolean;
  /**
   * Enables the configured CloudWatch alarm ticketing actions.
   *
   * @default the same as monitoring facade default
   */
  readonly actionsEnabled?: boolean;
  /**
   * Number of breaches required to transition into an ALARM state.
   *
   * @default the same as monitoring facade default
   */
  readonly datapointsToAlarm?: number;
  /**
   * Number of periods to consider when checking the number of breaching datapoints.
   *
   * @default the same as monitoring facade default
   */
  readonly evaluationPeriods?: number;
  /**
   * Period override for the metric to alarm on.
   *
   * @default the default specified in MetricFactory
   */
  readonly period?: Duration;
  /**
   * An optional link included in the generated ticket description body.
   *
   * @default no additional link will be added
   */
  readonly documentationLink?: string;
  /**
   * An optional link included in the generated ticket description body.
   *
   * @default no additional link will be added
   */
  readonly runbookLink?: string;
  /**
   * Indicates whether the alarming range of values should be highlighted in the widget.
   *
   * @default false
   */
  readonly fillAlarmRange?: boolean;
}
