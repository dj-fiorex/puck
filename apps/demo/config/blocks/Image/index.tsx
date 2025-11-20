import { Field, FieldLabel, type ComponentConfig } from "@measured/puck";

import { ColorField } from "../../fields/ColorField";

import { TemplateTextEditor } from "../../fields/TemplateField/TemplateField";
import {
  TemplateChip,
  transformText,
} from "../../fields/TemplateField/lib/template-renderer";

import { srcField } from "../../fields/srcField";
import { withExport } from "../../decorators/withExport";
import { withEvents } from "../../decorators/withEvents";
import { urlField } from "../../fields/urlField";
import { withAdminLayout } from "../../decorators/withAdminLayout";
import { ImageProps, ImageRender } from "./image";
import { withLayout } from "../../decorators/withLayout";

type AdminImageProps = Omit<
  ImageProps,
  "src" | "alt" | "linkUrl" | "mobile"
> & {
  src: { content: string; chips?: TemplateChip[] };
  alt: { content: string; chips?: TemplateChip[] };
  linkUrl: { content: string; chips?: TemplateChip[] };
  mobile: Omit<ImageProps, "src" | "alt" | "linkUrl" | "mobile"> & {
    src: { content: string; chips?: TemplateChip[] };
    alt: { content: string; chips?: TemplateChip[] };
    linkUrl: { content: string; chips?: TemplateChip[] };
  };
};

const baseFields: Record<string, Field> = {
  src: {
    ...srcField(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]),
    label: "Image Source - URL or path to the image file",
  },

  linkUrl: urlField(
    "Link URL - Make the image clickable with this destination"
  ),

  alt: {
    label: "Alt Text - Descriptive text for accessibility and SEO",
    type: "custom",
    // metadata: {
    //   title: "Hello, world",
    // },
    render: (props) => {
      const {
        onChange,
        field: { metadata, label = "Alt Text" },
      } = props;
      const { products } = metadata ?? {};
      return (
        <>
          <FieldLabel label={label}>
            <TemplateTextEditor
              initialTemplate={props.value}
              products={products}
              onSave={(template) => {
                //console.log("Text onChange", template);
                onChange(template);
              }}
            />
          </FieldLabel>
        </>
      );
    },
  },

  width: {
    type: "text",
    label:
      "Width - (Prefer AspectRatio) - Image width (e.g., 100px, 50%, auto)",
  },
  height: {
    type: "text",
    label:
      "Height - (Prefer AspectRatio) - Image height (e.g., 100px, 50%, auto)",
  },
  aspectRatio: {
    type: "text",
    label: "Aspect Ratio - Maintain proportions (e.g. 16/9, 4/3)",
  },
  alignment: {
    type: "select",
    label: "Alignment - Horizontal positioning of the image",
    options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ],
  },
  caption: {
    type: "text",
    label: "Caption - Text displayed below the image",
  },
  showCaption: {
    type: "select",
    label: "Show Caption - Toggle caption visibility",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  borderStyle: {
    type: "select",
    label: "Border Style - Type of border around the image",
    options: [
      { label: "None", value: "none" },
      { label: "Solid", value: "solid" },
      { label: "Double", value: "double" },
      { label: "Dotted", value: "dotted" },
      { label: "Dashed", value: "dashed" },
      { label: "Wavy", value: "wavy" },
    ],
  },
  borderWidth: {
    type: "text",
    label: "Border Width - Thickness of the border",
    placeholder: "e.g. 1px, 2px, 3px",
  },
  borderColor: {
    type: "custom",
    label: "Border Color - Color of the border",
    render: ColorField,
  },
  borderRadius: {
    type: "text",
    label: "Border Radius - Rounded corners size",
    placeholder: "e.g. 0px, 5px, 10px",
  },
  shadow: {
    type: "select",
    label: "Shadow - Drop shadow effect intensity",
    options: [
      { label: "None", value: "none" },
      { label: "Small", value: "sm" },
      { label: "Medium", value: "md" },
      { label: "Large", value: "lg" },
    ],
  },

  objectFit: {
    type: "select",
    label: "Object Fit - How the image fits within its container",
    options: [
      { label: "Cover", value: "cover" },
      { label: "Contain", value: "contain" },
      { label: "Fill", value: "fill" },
      { label: "None", value: "none" },
      { label: "Scale Down", value: "scale-down" },
    ],
  },

  className: {
    type: "text",
    label: "Class Name - Custom CSS class for styling",
  },
};

const defaultProps: Omit<ImageProps, "src" | "alt" | "mobile"> & {
  src: { content: string; chips?: TemplateChip[] };
  alt: { content: string; chips?: TemplateChip[] };
} = {
  src: { content: "/placeholder.png" },
  alt: { content: "Image description" },
  width: "auto",
  height: "auto",
  aspectRatio: 0,
  alignment: "center",
  caption: "",
  showCaption: false,
  borderStyle: "none",
  borderWidth: "0px",
  borderColor: "#000000",
  borderRadius: "0px",
  shadow: "none",
  linkUrl: "",
  objectFit: "cover",
  className: "",
};

const generalFields = {
  ...baseFields,
  mobile: {
    type: "object",
    label: "Mobile Settings",
    objectFields: baseFields,
  },
};

const openInNewTabField = {
  type: "select",
  label: "Open in New Tab",
  options: [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ],
};

const ImageInternal: ComponentConfig<AdminImageProps> = {
  fields: generalFields,
  defaultProps: {
    ...defaultProps,
    mobile: {},
  },
  resolveFields: (data, { fields, changed }) => {
    if (!changed?.linkUrl) {
      return fields;
    }

    const { openInNewTab, ...otherFields } = fields;

    if (data.props.linkUrl?.content?.length) {
      const fieldsToReturn: any = {};

      Object.keys(otherFields).forEach((key) => {
        const obj = otherFields[key];
        fieldsToReturn[key] = obj;
        if (key === "linkUrl") {
          fieldsToReturn.openInNewTab = openInNewTabField;
        }
      });

      return fieldsToReturn;
    }

    return otherFields;
  },
  resolveData: (data) => {
    return data;
  },
  render: ({ alt, src, puck, ...rest }) => {
    const { metadata } = puck;
    const { environment, products = [] } = metadata ?? {};
    const { magentoMediaUrl, frontendUrl } = environment ?? {};

    const altTrans = transformText(
      alt?.content || "",
      alt?.chips || [],
      products
    );
    const srcIsFromMagento = (src?.chips?.length ?? -1) > 0;

    const srcTrans = srcIsFromMagento
      ? `${magentoMediaUrl}${transformText(
          src?.content || "",
          src?.chips || [],
          products
        )}`
      : `${frontendUrl}/assets${src.content}`;

    return <ImageRender alt={altTrans} src={srcTrans} {...rest} />;
  },
};

const imageWithLayout = withLayout(ImageInternal);

export const Image = withExport(withEvents(withAdminLayout(imageWithLayout)));
