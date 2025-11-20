import { Field, type ComponentConfig } from "@measured/puck";

import { withExport } from "../../decorators/withExport";
import { withAdminLayout } from "../../decorators/withAdminLayout";
import { TabsProps, TabsRender } from "./tabs";
import { withLayout } from "../../decorators/withLayout";

const baseFields: Record<string, Field> = {
  className: {
    type: "text",
    label: "Class Name",
  },
};

const defaultProps: TabsProps = {
  currentIndex: 0,
  items: [],
  className: "",
};

const fields = {
  currentIndex: {
    type: "number",
    label: "Current Active Tab Index",
    min: 0,
  },
  items: {
    type: "array",
    label: "Slides",
    defaultItemProps: {
      header: [],
      content: [],
    },
    arrayFields: {
      header: {
        type: "slot",
        label: "Header Items",
      },
      content: {
        type: "slot",
        label: "Content Items",
      },
    },
  },

  ...baseFields,

  mobile: {
    type: "object",
    label: "Mobile Settings",
    objectFields: baseFields,
  },
};

const TabsInternal: ComponentConfig<TabsProps> = {
  fields,
  defaultProps: {
    ...defaultProps,
    mobile: {},
  },
  resolveFields: (data, { fields }) => {
    return fields;
  },
  resolveData: (data) => {
    return data;
  },
  render: TabsRender,
};

const tabsWithLayout = withLayout(TabsInternal);

export const Tabs = withExport(withAdminLayout(tabsWithLayout));
