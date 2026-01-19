import { AutoField, FieldLabel } from "@puckeditor/core";
import { useEffect, useState } from "react";
import { TemplateTextEditor } from "./TemplateField/TemplateField";

const MAX_CONFIRMATIONS = 1;

export const urlField = (label: string) => ({
  type: "custom",
  label,
  render: (props) => {
    const {
      onChange,
      value,
      field: { metadata, label = "Url field" },
    } = props;
    const { products } = metadata ?? {};
    const [fieldValue, setFieldValue] = useState(value ?? {});

    const [temptative, setTemptative] = useState(MAX_CONFIRMATIONS);

    useEffect(() => {
      if (!value) {
        setFieldValue({
          linkType: "geo",
          content: "",
          chips: [],
        });
      } else {
        setFieldValue(value);
      }
    }, [value]);

    return (
      <FieldLabel label={label}>
        <AutoField
          field={{
            type: "radio",

            options: [
              {
                value: "geo",
                label:
                  "Geo - The url will be based on the user's location (/_/)",
              },
              {
                value: "store",
                label:
                  "Store - The url will be based on the user's current store code (/{store_code}/)",
              },
            ],
          }}
          onChange={(val) => {
            const newValue = { ...fieldValue, linkType: val };
            setFieldValue(newValue);
            onChange(newValue);
          }}
          value={fieldValue?.linkType}
        />
        <TemplateTextEditor
          initialTemplate={fieldValue}
          products={products}
          onSave={(template) => {
            //console.log("URL onChange", template);
            if (template.content.includes("http") && temptative > 0) {
              setTemptative((t) => t - 1);
              return {
                success: false,
                message:
                  "Are you sure you want to include a FULL url? Click again to confirm.",
              };
            }
            setFieldValue((val) => ({ ...val, ...template }));
            onChange({ ...fieldValue, ...template });
          }}
        />
      </FieldLabel>
    );
  },
});
