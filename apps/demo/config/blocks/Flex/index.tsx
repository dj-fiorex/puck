import { type ComponentConfig } from "@puckeditor/core";

import { ColorField } from "../../fields/ColorField";

import { type FlexProps, FlexRender } from "./flex";

import { transformText } from "../../fields/TemplateField/lib/template-renderer";
import { srcField } from "../../fields/srcField";
import { backgroundSizeField } from "../../fields/backgroundSize";
import { urlField } from "../../fields/urlField";
import { withExport } from "../../decorators/withExport";
import { withEvents } from "../../decorators/withEvents";
import { withAdminLayout } from "../../decorators/withAdminLayout";
import { withLayout } from "../../decorators/withLayout";

const baseFields = {
  direction: {
    label:
      "Direction - Controls the main axis direction (row = horizontal, column = vertical)",
    type: "radio",
    options: [
      { label: "Row", value: "row" },
      { label: "Column", value: "column" },
    ],
  },
  justifyContent: {
    label: "Justify Content - Aligns items along the main axis",
    type: "radio",
    options: [
      { label: "Start", value: "start" },
      { label: "Center", value: "center" },
      { label: "End", value: "end" },
      { label: "Space Between", value: "space-between" },
      { label: "Space Around", value: "space-around" },
      { label: "Space Evenly", value: "space-evenly" },
    ],
  },
  alignItems: {
    label: "Align Items - Aligns items along the cross axis",
    type: "radio",
    options: [
      { label: "Start", value: "start" },
      { label: "Center", value: "center" },
      { label: "End", value: "end" },
    ],
  },
  gap: {
    label: "Gap - Spacing between flex items in pixels",
    type: "number",
    min: 0,
  },
  wrap: {
    label: "Wrap - Whether items wrap to next line when space runs out",
    type: "radio",
    options: [
      { label: "true", value: "wrap" },
      { label: "false", value: "nowrap" },
    ],
  },
  link: urlField(
    "Link address - URL or path where this element navigates on click"
  ),

  cursor: {
    type: "select",
    label: "Cursor - Mouse pointer style when hovering over this element",
    options: [
      { label: "Default", value: "default" },
      { label: "Pointer", value: "pointer" },
      { label: "Move", value: "move" },
      { label: "Text", value: "text" },
      { label: "Wait", value: "wait" },
      { label: "Zoom-in", value: "zoom-in" },
      { label: "Zoom-out", value: "zoom-out" },
    ],
  },
  height: {
    type: "text",
    label: "Height - CSS height value (e.g., 100px, 50%, auto)",
  },
  width: {
    type: "text",
    label: "Width - CSS width value (e.g., 100px, 50%, auto)",
  },
  margin: {
    type: "text",
    label: "Margin - Outer spacing around element (e.g., 10px, 1rem auto)",
  },
  border: {
    type: "text",
    label: "Border - CSS border style (e.g., 1px solid #000)",
  },
  borderRadius: {
    type: "text",
    label: "Border Radius - Rounds the corners of the element",
    placeholder: "e.g. 4px, 50%",
  },
  backgroundColor: {
    type: "custom",
    label: "Background Color - Fill color for the element background",
    render: ColorField,
  },
  backgroundImageSrc: {
    ...srcField(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]),
    label: "Background Image Source - Image file to display as background",
  },
  aspectRatio: {
    type: "text",
    label: "Aspect Ratio - Width to height ratio to maintain (e.g. 16/9, 4/3)",
  },
  backgroundOverlay: {
    type: "text",
    label: "Background Overlay - Color overlay on top of background image",
  },
  backgroundSize: backgroundSizeField,
  backgroundPosition: {
    label: "Background Position - Where the background image is positioned",
    type: "radio",
    options: [
      { label: "Center", value: "center" },
      { label: "Top", value: "top" },
      { label: "Bottom", value: "bottom" },
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
    ],
  },
  backgroundRepeat: {
    label: "Background Repeat - How the background image repeats",
    type: "radio",
    options: [
      { label: "Repeat", value: "repeat" },
      { label: "No Repeat", value: "no-repeat" },
      { label: "Repeat X", value: "repeat-x" },
      { label: "Repeat Y", value: "repeat-y" },
    ],
  },
  className: {
    type: "text",
    label: "Class Name - Custom CSS class names for styling",
  },
};

const fields = {
  ...baseFields,
  hideOnDesktop: {
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  hideOnMobile: {
    type: "radio",
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
  items: {
    type: "slot",
  },
  mobile: {
    type: "object",
    label: "Mobile Props",
    objectFields: {
      ...baseFields,
    },
  },
};

const defaultProps = {
  cursor: "default",
  mobile: {
    height: "100%",
    width: "100%",
  },
  height: "100%",
  width: "100%",
  justifyContent: "start",
  direction: "row",
  alignItems: "start",
  link: "",
  gap: 24,
  wrap: "wrap",
  margin: "auto",
  border: "none",
  borderRadius: "0px",
  layout: {
    grow: true,
  },
  backgroundOverlay: "",
  backgroundColor: "transparent",
  backgroundImageSrc: { content: "" },
  backgroundSize: "contain",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  items: [],
  className: "",
  hideOnDesktop: false,
  hideOnMobile: false,
  hideOnTablet: false,
};

const FlexInternal: ComponentConfig<FlexProps> = {
  fields,
  defaultProps,
  inline: true,
  resolveFields: (data, { fields }) => {
    return fields;
  },
  resolveData: (data) => {
    return data;
  },

  render: ({ puck, mobile, backgroundImageSrc, link, ...props }) => {
    const { metadata } = puck;
    const { environment, products = [] } = metadata ?? {};
    const { magentoMediaUrl, frontendUrl } = environment ?? {};

    const srcIsFromMagento = backgroundImageSrc?.chips?.length > 0;
    const srcMobileIsFromMagento =
      mobile?.backgroundImageSrc?.chips?.length > 0;

    const backgroundImageSrcTrans = srcIsFromMagento
      ? `${magentoMediaUrl}${transformText(
          backgroundImageSrc?.content || "",
          backgroundImageSrc?.chips || [],
          products
        )}`
      : `${frontendUrl}/assets${backgroundImageSrc.content}`;

    const backgroundImageSrcMobileTrans = mobile?.backgroundImageSrc
      ? srcMobileIsFromMagento
        ? `${magentoMediaUrl}${transformText(
            mobile?.backgroundImageSrc?.content || "",
            mobile?.backgroundImageSrc?.chips || [],
            products
          )}`
        : `${frontendUrl}/assets${mobile?.backgroundImageSrc.content}`
      : undefined;

    return (
      <FlexRender
        {...props}
        backgroundImageSrc={backgroundImageSrcTrans}
        mobile={{
          ...mobile,
          ...(backgroundImageSrcMobileTrans
            ? { backgroundImageSrc: backgroundImageSrcMobileTrans }
            : {}),
        }}
      />
    );
  },
};

const flexWithLayout = withLayout(FlexInternal);

export const Flex = withExport(withEvents(withAdminLayout(flexWithLayout)));
