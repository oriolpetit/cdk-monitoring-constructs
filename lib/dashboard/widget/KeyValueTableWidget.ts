import { TextWidget } from "monocdk/aws-cloudwatch";

import { FullWidth } from "../../common/widget";

export class KeyValueTableWidget extends TextWidget {
  constructor(data: [string, string][]) {
    super({
      width: FullWidth,
      height: 2,
      markdown: KeyValueTableWidget.toMarkdown(data),
    });
  }

  private static toMarkdown(data: [string, string][]) {
    let headerRow = "";
    let subHeaderRow = "";
    let valueRow = "";

    data.forEach(([key, value]) => {
      headerRow += "| " + key;
      subHeaderRow += "|---";
      valueRow += "| " + value;
    });

    return `${headerRow}\n${subHeaderRow}\n${valueRow}`;
  }
}
