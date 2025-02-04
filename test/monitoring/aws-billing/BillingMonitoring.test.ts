import { Stack } from "monocdk";
import { Template } from "monocdk/assertions";

import { BillingMonitoring } from "../../../lib";
import { TestMonitoringScope } from "../TestMonitoringScope";

test("snapshot test", () => {
  const stack = new Stack();

  const scope = new TestMonitoringScope(stack, "Scope");

  new BillingMonitoring(scope, {});

  expect(Template.fromStack(stack)).toMatchSnapshot();
});
