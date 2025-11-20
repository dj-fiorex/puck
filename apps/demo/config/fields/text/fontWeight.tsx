import { FieldLabel, AutoField } from "@measured/puck";
import { useMemo } from "react";

const fontWeightOptions = [
  { label: "Light (300)", value: "300" },
  { label: "Normal (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Semi-Bold (600)", value: "600" },
  { label: "Bold (700)", value: "700" },
  { label: "Extra-Bold (800)", value: "800" },
  { label: "Black (900)", value: "900" },
];

export const fontWeightField = {
  type: "custom" as const,
  label: "Font Weight",
  render: (props) => {
    const {
      onChange,
      value,
      field: { label = "Font Weight" },
    } = props;
    const options = useMemo(() => {
      return !value
        ? fontWeightOptions
        : [
            ...fontWeightOptions,
            ...(fontWeightOptions.some((option) => option.value === value)
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
