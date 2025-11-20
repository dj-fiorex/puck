import { CodeField } from "./CodeField";

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

export const eventsField = {
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

export const eventsResolveFields = (
  data: any,
  { changed, lastFields }: any,
) => {
  if (!changed?.useEvent) {
    return lastFields;
  }
  const { events, ...rest } = lastFields;
  if (data.props.useEvent) {
    return {
      events: eventsField,
      ...rest,
    };
  }
  return rest;
};
