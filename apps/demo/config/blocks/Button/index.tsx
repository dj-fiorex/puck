import {
  AutoField,
  createUsePuck,
  FieldLabel,
  type ComponentConfig,
  type PuckComponent,
} from "@puckeditor/core";

import { ColorField } from "../../fields/ColorField";
import { fontWeightField } from "../../fields/text/fontWeight";
import { fontFamilyField } from "../../fields/text/fontFamily";
import { fontSizeField } from "../../fields/text/fontSize";
import { TemplateTextEditor } from "../../fields/TemplateField/TemplateField";
import { transformText } from "../../fields/TemplateField/lib/template-renderer";
import { merge } from "lodash";
import { urlField } from "../../fields/urlField";
import { withEvents } from "../../decorators/withEvents";
import { withExport } from "../../decorators/withExport";
import { withAdminLayout } from "../../decorators/withAdminLayout";
import { useEffect, useState } from "react";
import { CodeField } from "../../fields/CodeField";
import { ButtonGroup } from "../../../app/app/_components/ui/button-group";
import { Button as _Button, type ButtonProps } from "./button";
import { withLayout } from "../../decorators/withLayout";
const usePuck = createUsePuck();

type AdminButtonProps = Omit<ButtonProps, "label" | "href"> & {
  label: { content: string; chips: unknown[] };
  href: { content: string; chips: unknown[] };
};

const render: PuckComponent<AdminButtonProps> = (props) => {
  const { mobile, puck, ...desktop } = props;

  const fixedMobileProps = merge({}, desktop, mobile);

  const isMobile = usePuck((s) => s.appState.ui.viewports.current.width < 640);

  const { label, href, tabIndex, className, ...rest } = isMobile
    ? fixedMobileProps
    : props;

  const currentTabIndex = puck?.isEditing ? -1 : tabIndex;

  const { metadata } = puck;

  //console.log("PUCKMETADATA", metadata);

  const currentHref = puck?.isEditing
    ? "#"
    : transformText(
        href?.content || "",
        href?.chips || [],
        metadata?.products || []
      );

  const currentLabel = transformText(
    label?.content || "",
    label?.chips || [],
    metadata?.products || []
  );

  return (
    <ButtonRender
      {...rest}
      className={`puck-button ${className}`}
      tabIndex={currentTabIndex}
      href={currentHref}
      label={currentLabel}
    />
  );
};

const ButtonRender: PuckComponent<ButtonProps> = ({
  href,
  variant,
  label,
  size,
  className,
  backgroundColor,
  textColor,
  puck,
  ...rest
}) => {
  return (
    <_Button
      className={`puck-button ${className}`}
      variant={variant}
      size={size}
      backgroundColor={backgroundColor}
      textColor={textColor}
      tabIndex={puck?.isEditing ? -1 : undefined}
      href={puck?.isEditing ? "#" : href}
      label={label}
      {...rest}
    />
  );
};

const baseFields = {
  label: {
    type: "custom",
    label: "Button text",
    metadata: {
      suffix:
        "Use {{product.name}} for dynamic content. This text will be displayed on the button.",
    },
    render: (props) => {
      const {
        onChange,
        value,
        field: { metadata, label = "Button text" },
      } = props;
      const { products } = metadata ?? {};
      return (
        <FieldLabel label={label}>
          <TemplateTextEditor
            initialTemplate={value}
            products={products}
            onSave={(template) => {
              // console.log("Text onChange", template);
              onChange(template);
            }}
          />
        </FieldLabel>
      );
    },
  },

  href: urlField("Button URL - URL or path to navigate to (withouth slash)"),

  backgroundColor: {
    type: "custom",
    label: "Background Color",
    render: ColorField,
  },

  textColor: {
    type: "custom",
    label: "Text Color",
    render: ColorField,
  },

  fontFamily: fontFamilyField,

  fontSize: fontSizeField,

  fontWeight: fontWeightField,

  fontStyle: {
    type: "select",
    options: [
      { label: "Normal", value: "normal" },
      { label: "Italic", value: "italic" },
      { label: "Oblique", value: "oblique" },
    ],
  },

  letterSpacing: {
    type: "text",
    label: "Letter Spacing - Space between characters",
    placeholder: "e.g. 1.5px, 0.1em",
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

  padding: {
    type: "text",
    label:
      "Padding - [top] [right] [bottom] [left] or [top/bottom] [left/right] or [all]",
  },

  margin: {
    type: "text",
    label:
      "Margin - [top] [right] [bottom] [left] or [top/bottom] [left/right] or [all]",
  },

  border: {
    type: "text",
    label: "Border - [width] [style] [color]",
  },

  borderRadius: {
    type: "text",
    label:
      "Border Radius - [top-left] [top-right] [bottom-right] [bottom-left] or [all]",
    placeholder: "e.g. 4px, 50%",
  },

  align: {
    type: "radio",
    options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ],
  },

  position: {
    type: "select",
    label: "Position",
    options: [
      { label: "Static", value: "static" },
      { label: "Relative", value: "relative" },
      { label: "Absolute", value: "absolute" },
      { label: "Fixed", value: "fixed" },
      { label: "Sticky", value: "sticky" },
    ],
  },

  display: {
    type: "select",
    label: "Display",
    options: [
      { label: "Inline", value: "inline" },
      { label: "Inline Block", value: "inline-block" },
      { label: "Inline Flex", value: "inline-flex" },
      { label: "Block", value: "block" },
      { label: "Flex", value: "flex" },
      { label: "Grid", value: "grid" },
      { label: "None", value: "none" },
    ],
  },

  width: {
    type: "text",
    label: "Width - e.g. 100px, 50%, auto",
    placeholder: "e.g. 100px, 50%, auto",
  },

  afterCss: {
    type: "custom",
    label: "After CSS - Use it with :hover or :active css",
    metadata: {
      editorSettings: {
        height: "200px",
        defaultLanguage: "css",
        theme: "vs-dark",
        savingText: "Saving...",
        saveText: "Save",
        prefix: `.button:after {`,
        suffix: `}`,
      },
    },
    render: (props) => {
      const { onChange, value, field } = props;
      const { metadata, label = "Url field" } = field;
      const { products } = metadata ?? {};
      const [fieldValue, setFieldValue] = useState(value ?? "");

      useEffect(() => {
        if (!value) {
        } else {
          setFieldValue(value);
        }
      }, [value]);

      const onTemplateClick = (
        event: React.MouseEvent<HTMLButtonElement>,
        type: string
      ) => {
        event.preventDefault();
        if (type === "underline_animation") {
          onChange(underlineHooverAnimationAfter);
          return;
        }
        //console.log(`Type: ${type} not implemented`);
      };

      return (
        <FieldLabel label={label}>
          <ButtonGroup>
            <_Button
              variant="outline"
              onClick={(e) => onTemplateClick(e, "underline_animation")}
            >
              Underline animation
            </_Button>
            <_Button
              variant="outline"
              onClick={(e) => onTemplateClick(e, "bounce")}
            >
              Bounce
            </_Button>
          </ButtonGroup>
          <CodeField field={field} onChange={onChange} value={fieldValue} />
        </FieldLabel>
      );
    },
  },
  hoverAfterCss: {
    type: "custom",
    label: "Hover After CSS",
    metadata: {
      editorSettings: {
        height: "200px",
        defaultLanguage: "css",
        theme: "vs-dark",
        savingText: "Saving...",
        saveText: "Save",
        prefix: `.button:hover:after {`,
        suffix: `}`,
      },
    },
    render: (props) => {
      const { onChange, value, field } = props;
      const { metadata, label = "Hover After CSS" } = field;
      const { products } = metadata ?? {};
      const [fieldValue, setFieldValue] = useState(value ?? "");

      useEffect(() => {
        if (!value) {
        } else {
          setFieldValue(value);
        }
      }, [value]);

      const onTemplateClick = (
        event: React.MouseEvent<HTMLButtonElement>,
        type: string
      ) => {
        event.preventDefault();
        if (type === "underline_animation") {
          onChange(underlineHooverAnimationHoverAfter);
          return;
        }
        //console.log(`Type: ${type} not implemented`);
      };

      return (
        <FieldLabel label={label}>
          <ButtonGroup>
            <_Button
              variant="outline"
              onClick={(e) => onTemplateClick(e, "underline_animation")}
            >
              Underline animation
            </_Button>
            <_Button
              variant="outline"
              onClick={(e) => onTemplateClick(e, "bounce")}
            >
              Bounce
            </_Button>
          </ButtonGroup>
          <CodeField field={field} onChange={onChange} value={fieldValue} />
        </FieldLabel>
      );
    },
  },

  className: { type: "text" },
};

const fields = {
  ...baseFields,
  mobile: {
    type: "object",
    objectFields: baseFields,
  },
};

const defaultProps: AdminButtonProps = {
  label: { content: "Button", chips: [] },
  href: { content: "#", chips: [] },
  align: "left",
  variant: "primary",
  size: "default",
  backgroundColor: "#000000",
  textColor: "#ffffff",
  className: "",
  fontFamily: "",
  fontSize: "",
  fontWeight: "normal",
  fontStyle: "normal",
  padding: "",
  margin: "",
  border: "",
  borderRadius: "",
  position: "static",
  display: "inline-flex",
  width: "auto",
  textDecorationLine: "none",
  letterSpacing: "normal",
};

const underlineHooverAnimationAfter = `
    display: block;
    content: '';
    border-bottom: solid 1px #000000;
    transform: scaleX(0);
    transition: transform 250ms ease-in-out;
    transform-origin: 100% 50%;
`;
const underlineHooverAnimationHoverAfter = `
    transform: scaleX(1);
`;

export const ButtonInternal: ComponentConfig<AdminButtonProps> = {
  label: "Button",
  fields,
  defaultProps,
  resolveFields: (data, { fields, changed }) => {
    return fields;
  },
  resolveData: (data) => {
    return data;
  },
  render,
};

const buttonWithLayout = withLayout(ButtonInternal);

export const Button = withExport(withEvents(withAdminLayout(buttonWithLayout)));
