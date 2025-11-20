/**
 * Decorator for Puck block configuration that adds an "Export" field to the admin UI,
 * enabling users to export the block's configuration as JSON. This decorator augments
 * the block with an `exportCmp` field, which renders an export button in the admin.
 * When triggered, it copies the block's configuration to the clipboard and shows a toast notification.
 *
 * This decorator is intended for use only in the admin interface and does not affect
 * the block's frontend rendering, so it is not exposed via skin-puck-kit or skin-ui-kit.
 *
 * @template ThisComponentConfig - The type of the Puck block configuration being decorated.
 * @param componentConfig - The original block configuration to decorate.
 * @returns The decorated block configuration with export functionality.
 */

import type { ComponentConfig, DefaultComponentProps } from "@measured/puck";

export type WithExport<Props extends DefaultComponentProps> = Props & {
  export: boolean;
};

const exportCmpFields = {
  type: "custom",
  label: "Export",
  render: (props: any) => {
    const { onChange } = props;
    return (
      <div>
        <p>
          Export the component configuration as JSON to use it in another
          project.
        </p>
        <button
          onClick={() => {
            onChange(true);
          }}
        >
          Export Component
        </button>
      </div>
    );
  },
};

const resolveData =
  (componentConfig: any) => async (data: any, params: any) => {
    const { changed, lastData } = params;

    let resolvedData = data;

    if (componentConfig.resolveData) {
      // Check if resolveData return Promise or not
      resolvedData = await componentConfig.resolveData(data, params);
    }

    if (!lastData) {
      return resolvedData;
    }

    if (changed?.exportCmp) {
      //console.log("Exporting component data:", resolvedData);
      navigator.clipboard.writeText(JSON.stringify(resolvedData, null, 2));
      const { exportCmp, ...rest } = resolvedData.props;
      return {
        ...resolvedData,
        props: {
          ...rest,
        },
      };
    }
    return resolvedData;
  };

export function withExport<
  ThisComponentConfig extends ComponentConfig<any> = ComponentConfig
>(componentConfig: ThisComponentConfig): ThisComponentConfig {
  return {
    ...componentConfig,

    fields: {
      exportCmp: exportCmpFields,
      ...componentConfig.fields,
    },

    resolveData: resolveData(componentConfig),
  };
}
