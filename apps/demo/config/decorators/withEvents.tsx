/**
 * Decorator for Puck blocks that adds event handling configuration fields to the admin UI.
 *
 * This decorator injects a `useEvent` field and, when enabled, an `events` array field
 * allowing users to configure custom events for the block. It also provides logic to
 * conditionally show/hide the events field and to remove event data from the payload
 * when not in use.
 *
 * This decorator is intended for use only in the admin interface and does not affect
 * the block's frontend rendering, so it is not exposed via skin-puck-kit or skin-ui-kit.
 *
 * @param componentConfig - The original Puck block configuration to decorate.
 * @returns The decorated block configuration with event fields and processing logic.
 */

import type { ComponentConfig, DefaultComponentProps } from "@/core/types";
import { CodeField } from "../fields/CodeField";

const descriptionText = `  
// Example for "puck:slideChange" event

{
  "current": 2, // Index of the new active slide
}

// Example for "video:togglePlay" event
{
  "restart": true // Set to true to restart the video if play the video
}
`;

const eventsField = {
  type: "array",
  label: "Events",
  arrayFields: {
    type: {
      type: "select",
      label: "Event Type",
      options: [
        { label: "Swiper Slide change", value: "puck:slideChange" },
        { label: "Video Toggle play", value: "video:togglePlay" },
      ],
    },
    targetId: { type: "text", label: "Target element id" },
    data: {
      type: "custom",
      label: "Event Data (JSON)",
      render: CodeField,
      metadata: {
        descriptionCmp: () => (
          <>
            <p>You can send different event data for each event type.</p>
            <pre>{descriptionText}</pre>
          </>
        ),

        editorSettings: {
          height: "200px",
          defaultLanguage: "json",
          theme: "vs-dark",
          savingText: "Saving...",
          saveText: "Save",
          //prefix: `{`,
          //suffix: `}`,
          //getFullValue: true,
        },
      },
    },
  },
};

const useEventField = {
  type: "select",
  label: "Use Event",
  options: [
    { label: "No", value: false },
    { label: "Yes", value: true },
  ],
};

// This function scope is to add "events" field if useEvents=true
const resolveFields =
  (componentConfig: any) => async (data: any, params: any) => {
    const { changed, fields } = params;
    let resolvedFields = fields;

    if (componentConfig.resolveFields) {
      // Check if resolveFields return Promise or not
      resolvedFields = await componentConfig.resolveFields(data, params);
    }

    if (!changed?.useEvent) {
      return resolvedFields;
    }
    const { events, ...rest } = resolvedFields;
    if (data.props.useEvent) {
      return {
        events: eventsField,
        ...rest,
      };
    }
    return rest;
  };

// This function scope is to remove "events" from payload if useEvents=false
const resolveData =
  (componentConfig: any) => async (data: any, params: any) => {
    const { changed } = params;

    let resolvedData = data;

    if (componentConfig.resolveData) {
      // Check if resolveData return Promise or not
      resolvedData = await componentConfig.resolveData(data, params);
    }

    if (!changed?.useEvent) {
      // useEvent is not changed, return payload as is
      return resolvedData;
    }
    if (!resolvedData.props.useEvent) {
      // If useEvent is false, we remove events from payload
      const { events, ...rest } = resolvedData.props;
      return {
        ...resolvedData,
        props: {
          ...rest,
        },
      };
    }
    // useEvents = true, we don't do anything
    return resolvedData;
  };

export function withEvents<
  ThisComponentConfig extends ComponentConfig<any> = ComponentConfig
>(componentConfig: ThisComponentConfig): ThisComponentConfig {
  return {
    ...componentConfig,

    fields: {
      useEvent: useEventField,
      ...componentConfig.fields,
    },

    defaultProps: {
      useEvent: false,
      ...(componentConfig.defaultProps ?? {}),
    },

    resolveFields: resolveFields(componentConfig),

    resolveData: resolveData(componentConfig),
  };
}

export type withEvents<Props extends DefaultComponentProps> = Props & {
  useEvent: boolean;
  events?: { type: string; targetId: string; data: any };
};
