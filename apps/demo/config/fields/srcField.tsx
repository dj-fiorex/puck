import { FieldLabel } from "@measured/puck";
import { MediaField } from "./MediaField";
import { TemplateTextEditor } from "./TemplateField/TemplateField";

export const srcField = (accept: string[] = ["video/mp4"]) => ({
  type: "custom" as const,

  render: (props) => {
    const {
      onChange,
      value,
      field: { metadata, label },
    } = props;
    const { products, environment } = metadata ?? {};
    const { magentoMediaUrl, frontendUrl } = environment ?? {};
    const isFromMagento = value?.chips?.length > 0;
    const currentValue = !value?.content
      ? ""
      : isFromMagento
        ? `${magentoMediaUrl}${value?.content}`
        : `${frontendUrl}/assets${value?.content}`;

    return (
      <>
        <FieldLabel label={label}>
          <MediaField
            {...props}
            accept={accept}
            value={currentValue}
            onChange={(value) => {
              //console.log("Image src onChange", value);
              if (!value?.length) {
                onChange({ content: "" });
                return;
              }
              onChange({ content: value[0] });
            }}
          />
          <div className="py-2"></div>
          <TemplateTextEditor
            initialTemplate={props.value}
            products={products}
            environment={environment}
            onSave={(template) => {
              onChange(template);
            }}
          />
        </FieldLabel>
      </>
    );
  },
});
