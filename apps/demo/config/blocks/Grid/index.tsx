import type { ComponentConfig } from "@measured/puck";

import { type GridProps, GridRender } from "./grid";
import { withExport } from "../../decorators/withExport";
import { withEvents } from "../../decorators/withEvents";
import { withAdminLayout } from "../../decorators/withAdminLayout";
import { withLayout } from "../../decorators/withLayout";

const baseFields = {
  numColumns: {
    type: "number",
    label: "Number of columns - Sets the default number of columns in the grid",
    min: 1,
    max: 12,
  },
  gap: {
    label: "Gap - Spacing between grid items",
    type: "text",
  },
};

const fields = {
  ...baseFields,
  numColumnsOptions: {
    type: "array",
    label:
      "Dynamic Columns Options (icon size 20px) - Configure responsive column layouts with custom icons",
    arrayFields: {
      numColumns: {
        type: "number",
        label: "Number of Columns - Column count for this breakpoint",
        min: 1,
        max: 12,
      },
      iconSrc: {
        type: "text",
        label: "Icon Source - URL or path to the icon image",
      },
    },
  },
  items: {
    type: "slot",
    label: "Items - Content blocks to display in the grid",
  },
  hideOnDesktop: {
    type: "radio",
    label: "Hide on Desktop - Controls visibility on desktop devices",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  hideOnMobile: {
    type: "radio",
    label: "Hide on Mobile - Controls visibility on mobile devices",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  hideOnTablet: {
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  mobile: {
    type: "object",
    label: "Mobile Settings",
    objectFields: baseFields,
  },
  tablet: {
    type: "object",
    label: "Tablet Settings",
    objectFields: baseFields,
  },
};

const defaultProps = {
  numColumns: 4,
  gap: "24px",
  numColumnsOptions: [],
  items: [],
  hideOnDesktop: false,
  hideOnMobile: false,
  hideOnTablet: false,
  mobile: {
    numColumns: 1,
    gap: "0px",
  },
  tablet: {
    numColumns: 4,
    gap: "24px",
  },
};

export const GridInternal: ComponentConfig<GridProps> = {
  fields,
  defaultProps,
  resolveFields: (data, { fields }) => {
    return fields;
  },
  resolveData: (data) => {
    return data;
  },
  render: GridRender,
};

const gridWithLayout = withLayout(GridInternal);

export const Grid = withExport(withEvents(withAdminLayout(gridWithLayout)));
