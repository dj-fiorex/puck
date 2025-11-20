import { useMemo } from "react";
import { puckBaseConfig } from "../puckBaseConfig";

import type { PuckComponent, Slot } from "@measured/puck";

import { withLayout } from "../decorators/withLayout";

export type TemplateProps = {
  template: string;
  children: Slot;
};

export const TemplateRender: PuckComponent<TemplateProps> = ({
  children: Children,
}) => {
  return <Children />;
};

const transformTemplate = (content) => {
  return content?.map((item) => {
    const { type, props } = item;

    const { id, ...newProps } = props ?? {};

    // If the item has an 'items' array, recursively traverse it
    if (newProps.items) {
      newProps.items = transformTemplate(newProps.items);
    }

    return {
      type,
      props: newProps,
    };
  });
};

export const useResolvedConfig = (fields = {}, templates: any[] = []) => {
  const resolvedConfig = useMemo(() => {
    const puckComponents: Record<string, any> = {};

    if (templates) {
      for (const template of templates) {
        const { name, content } = template;
        const transformedContent = transformTemplate(content);
        puckComponents[name.replaceAll("TMP-", "")] = withLayout({
          fields: {
            children: {
              type: "slot",
            },
          },
          defaultProps: {
            children: transformedContent,
          },
          render: TemplateRender,
        });
      }
    }

    const toReturn = puckBaseConfig(fields, puckComponents);

    return toReturn;
  }, [fields, templates]);

  return resolvedConfig;
};
