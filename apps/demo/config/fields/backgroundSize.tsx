import { AutoField, Field, FieldLabel } from "@puckeditor/core";
import { useMemo } from "react";

const backgroundSizeOptions = [
  { label: "Cover", value: "cover" },
  { label: "Contain", value: "contain" },
  { label: "Auto", value: "auto" },
];

export const backgroundSizeField: Field<string> = {
  type: "custom",
  label: "Background Size",
  render: (props) => {
    const {
      onChange,
      value,
      field: { label = "Background Size" },
    } = props;
    const options = useMemo(() => {
      return !value
        ? backgroundSizeOptions
        : [
            ...backgroundSizeOptions,
            ...(backgroundSizeOptions.some((option) => option.value === value)
              ? []
              : [
                  {
                    value: value,
                    label: value,
                  },
                ]),
          ];
    }, [value]);
    return (
      <FieldLabel label={label}>
        <AutoField
          field={{ type: "select", options: options }}
          onChange={onChange}
          value={value}
        />
        <AutoField field={{ type: "text" }} onChange={onChange} value={value} />
      </FieldLabel>
    );
  },
};
