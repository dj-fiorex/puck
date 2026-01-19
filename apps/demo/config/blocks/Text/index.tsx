import {
  createUsePuck,
  FieldLabel,
  type ComponentConfig,
} from "@puckeditor/core";

import { TemplateTextEditor } from "../../fields/TemplateField/TemplateField";
import { transformText } from "../../fields/TemplateField/lib/template-renderer";
import { ColorField } from "../../fields/ColorField";
import { fontWeightField } from "../../fields/text/fontWeight";
import { fontFamilyField } from "../../fields/text/fontFamily";
import { fontSizeField } from "../../fields/text/fontSize";
import { merge } from "lodash";
import { withExport } from "../../decorators/withExport";
import { withEvents } from "../../decorators/withEvents";
import { withAdminLayout } from "../../decorators/withAdminLayout";
import { TextProps, TextRender } from "./text";
import { withLayout } from "../../decorators/withLayout";

const usePuck = createUsePuck();

const textTypeOptions = [
  { label: "Paragraph", value: "p" },
  { label: "Span", value: "span" },
  { label: "Title H1", value: "h1" },
  { label: "Title H2", value: "h2" },
  { label: "Title H3", value: "h3" },
  { label: "Title H4", value: "h4" },
  { label: "Title H5", value: "h5" },
  { label: "Title H6", value: "h6" },
];

const baseFields = {
  text: {
    type: "custom",
    label: "Text",

    render: (props) => {
      const {
        onChange,
        value,
        field: { metadata, label = "Button text" },
      } = props;
      const { products, environment } = metadata ?? {};
      return (
        <FieldLabel label={label}>
          <TemplateTextEditor
            initialTemplate={value}
            products={products}
            environment={environment}
            onSave={(template) => {
              //console.log("Text onChange", template);
              onChange(template);
            }}
          />
        </FieldLabel>
      );
    },
  },
  size: fontSizeField,

  align: {
    type: "radio",
    label: "Align - Text alignment",
    options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ],
  },

  lineHeight: {
    type: "text",
    label: "Line Height - Space between lines of text",
    placeholder: "e.g. 1.5, 24px",
  },

  letterSpacing: {
    type: "text",
    label: "Letter Spacing - Space between characters",
    placeholder: "e.g. 1.5px, 0.1em",
  },

  fontFamily: fontFamilyField,

  fontWeight: fontWeightField,

  fontStyle: {
    type: "select",
    label: "Font Style - Text style variant",
    options: [
      { label: "Normal", value: "normal" },
      { label: "Italic", value: "italic" },
      { label: "Oblique", value: "oblique" },
    ],
  },

  textShadow: {
    type: "text",
    label:
      "Text Shadow - [horizontal offset] [vertical offset] [blur radius] [color]",
    placeholder: "e.g. 2px 2px 4px #000000",
  },

  textDecorationLine: {
    type: "select",
    label: "Text Decoration Line - Type of line decoration",
    options: [
      { label: "None", value: "none" },
      { label: "Underline", value: "underline" },
      { label: "Overline", value: "overline" },
      { label: "Line Through", value: "line-through" },
    ],
  },

  textDecorationStyle: {
    type: "select",
    label: "Text Decoration Style - Style of the decoration line",
    options: [
      { label: "None", value: "none" },
      { label: "Solid", value: "solid" },
      { label: "Double", value: "double" },
      { label: "Dotted", value: "dotted" },
      { label: "Dashed", value: "dashed" },
      { label: "Wavy", value: "wavy" },
    ],
  },

  textDecorationThickness: {
    type: "text",
    label: "Text Decoration Thickness - Width of the decoration line",
    placeholder: "e.g. 2px, 0.1em",
  },

  textUnderlineOffset: {
    type: "text",
    label: "Text Underline Offset - Distance from text to underline",
    placeholder: "e.g. 2px, 0.1em",
  },

  textDecorationColor: {
    type: "custom",
    label: "Text Decoration Color - Color of the decoration line",
    render: ColorField,
  },

  color: {
    type: "custom",
    label: "Color - Text color",
    render: ColorField,
  },

  maxWidth: {
    type: "text",
    label: "Max Width - Maximum width of the text container",
  },
};

const fields = {
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
  type: {
    type: "radio",
    label: "Type - Text element type",
    options: textTypeOptions,
  },
  ...baseFields,
  className: {
    type: "text",
    label: "Class Name",
  },
  mobile: {
    type: "object",
    objectFields: {
      ...baseFields,
    },
  },
};

const TextInner: ComponentConfig<TextProps> = {
  fields,
  defaultProps: {
    align: "left",
    text: { content: "Text" },
    size: "16px",
    color: "#000000",
    fontWeight: "400",
    fontStyle: "normal",
    maxWidth: "100%",
    className: "",
    mobile: {},
    letterSpacing: "normal",
  },
  resolveFields: (data, { fields }) => {
    return fields;
  },
  resolveData: (data) => {
    return data;
  },
  render: (props) => {
    const {
      mobile,
      hideOnMobile = false,
      hideOnTablet = false,
      hideOnDesktop = false,
      className = "",
      puck,
      ...otherProps
    } = props;

    const { metadata } = puck;

    const isMobile = usePuck(
      (s) => s.appState.ui.viewports.current.width < 640
    );

    let currentProps = isMobile ? merge({}, otherProps, mobile) : otherProps;

    const t = transformText(
      currentProps.text?.content || "",
      currentProps.text?.chips || [],
      metadata?.products || []
    );

    currentProps = {
      ...currentProps,
      text: t,
      hideOnDesktop,
      hideOnMobile,
      hideOnTablet,
      className,
    };

    return <TextRender {...currentProps} />;
  },
};

const textWithLayout = withLayout(TextInner);

export const Text = withExport(withEvents(withAdminLayout(textWithLayout)));
