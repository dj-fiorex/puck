import { FieldLabel, AutoField } from "@puckeditor/core";
import { useEffect, useMemo } from "react";

export const fontFamilyField = {
  type: "custom",
  label: "Font Family",
  render: (props) => {
    // Get available fonts from the puck metadata
    const {
      onChange,
      value,
      field: { metadata, label },
    } = props;
    const { fonts } = metadata ?? {};
    const options = useMemo(() => {
      return (
        fonts?.map((font) => ({
          label: font.name,
          value: font.fontFamily,
        })) || []
      );
    }, [fonts]);
    useEffect(() => {
      if (options.length === 1) {
        // If there's only one option, use it directly
        onChange(options[0].value);
      }
    }, [options]);
    return (
      <FieldLabel label={label}>
        <AutoField
          field={{ type: "select", options: options }}
          onChange={onChange}
          value={value}
        />
      </FieldLabel>
    );
  },
};
