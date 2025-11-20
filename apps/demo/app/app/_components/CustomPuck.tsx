"use client";
import { AutoField, type Config, Puck } from "@measured/puck";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { DefaultHeaderActions } from "./DefaultHeaderActions";
import { useDeepCompareMemo } from "use-deep-compare";

const globalStyle = `
@media screen and (max-width: 640px) {
  .hidden-mobile {
    display: none!important;
  }
}

@media screen and (min-width: 641px) and (max-width: 1024px) {
  .hidden-tablet {
    display: none!important;
  }
}

@media screen and (min-width: 1025px) {
  .hidden-desktop {
    display: none!important;
  }
}
`;

const customJoditStyles = `
 ul {
	list-style-type: disc;
	margin: 0;
	padding: 0 20px 10px;
}

ul ul {
	list-style-type: circle;
}

 ul ul ul {
	list-style-type: square;
}

 ol {
	list-style-type: decimal;
	padding-left: 40px;
	margin-top: 1em;
	margin-bottom: 1em;
}

 ol ol {
	margin-top: 0;
	margin-bottom: 0;
}

 td {
	border: solid 1px;
}
  `;

type Font = {
  fontFamily: string;
  src: string;
  fontWeight: string;
  fontStyle: string;
};
export interface CustomPuckProps<T> {
  headerTitle?: string;
  data?: T;
  config: Config;
  metadata?: Record<string, any>;
  headerActionsPreSlot?: (usePuck: any) => React.ReactNode;
  headerActionsPostSlot?: (usePuck: any) => React.ReactNode;
  fonts: Font[];
}

export function CustomPuck<T>({
  headerTitle = "Form Editor",
  config,
  data,
  headerActionsPreSlot,
  headerActionsPostSlot,
  metadata = {},
  fonts = [],
}: CustomPuckProps<T>) {
  const {
    content = [],
    createdAt,
    updatedAt,
    id,
    ...rest
  } = data ?? ({} as any);

  const completeOverrides = {
    fieldTypes: {
      object: (props) => {
        const { children, onChange, name, field, ...rest } = props;
        if (field.metadata?.override === true) {
          return children;
        }
        return (
          <>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>{name}</AccordionTrigger>
                <AccordionContent>
                  <AutoField
                    {...props}
                    field={{
                      ...field,
                      metadata: { ...field.metadata, override: true },
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        );
      },
    },
    headerActions: () => (
      <DefaultHeaderActions
        PreSlot={headerActionsPreSlot}
        PostSlot={headerActionsPostSlot}
        metadata={metadata}
      />
    ),
  };

  // Add metadata to all fields
  const patchedConfig = useDeepCompareMemo(() => {
    const clonedConfig: Config = { ...config };

    Object.keys(clonedConfig.components).forEach((key) => {
      const component = clonedConfig.components[key];
      if (!component) return;
      // Add metadata to each field
      if (!component.fields) return;
      Object.keys(component.fields).forEach((fieldKey) => {
        const field = component.fields?.[fieldKey];
        if (!field) return;

        if (field.type === "object") {
          // for each objectFields
          // @ts-expect-error objectFields exists
          Object.keys(field.objectFields).forEach((objectFieldKey) => {
            // @ts-expect-error objectFields exists
            const objectField = field.objectFields[objectFieldKey];
            objectField.metadata = {
              ...(objectField.metadata ?? {}),
              ...metadata,
            };
          });
        }
        field.metadata = {
          ...(field.metadata ?? {}),
          ...metadata,
        };
      });
    });

    const fontsStyle = `
      ${fonts
        ?.map(
          (font) => `
        @font-face {
          font-family: '${font.fontFamily}';
          src: url('${font.src}') format('woff2');
          font-weight: ${font.fontWeight};
          font-style: ${font.fontStyle};
        }
      `,
        )
        .join("\n")}
    `;

    if (!clonedConfig.root) {
      clonedConfig.root = {};
    }

    clonedConfig.root.render = ({
      children,
    }: {
      children: React.ReactNode;
    }) => {
      return (
        <>
          <style>{globalStyle}</style>
          <style>{customJoditStyles}</style>
          <style>{fontsStyle}</style>
          <div style={{ padding: "16px", maxWidth: "1440px" }}>{children}</div>
        </>
      );
    };

    return clonedConfig;
  }, [config, fonts, metadata]);

  return (
    <Puck
      headerTitle={headerTitle}
      config={patchedConfig}
      overrides={completeOverrides}
      metadata={metadata}
      data={{
        root: {
          props: {
            ...rest,
            createdAt: createdAt?.toISOString(),
            updatedAt: updatedAt?.toISOString(),
            itemId: id,
          },
        },
        content,
      }}
    />
  );
}

export default CustomPuck;
