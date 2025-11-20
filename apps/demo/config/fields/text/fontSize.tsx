import { FieldLabel, AutoField } from "@measured/puck";
import { useMemo } from "react";

// Assuming "m" (medium) = 16px, and scaling up/down typically by a factor (commonly 1.25 or 1.333)
const sizeOptions = [
  { value: "64px", label: "XXXL (64px)" }, // 16 * 4
  { value: "48px", label: "XXL (48px)" }, // 16 * 3
  { value: "32px", label: "XL (32px)" }, // 16 * 2
  { value: "24px", label: "L (24px)" }, // 16 * 1.5
  { value: "16px", label: "M (16px)" }, // base
  { value: "14px", label: "S (14px)" }, // 16 * 0.875
  { value: "12px", label: "XS (12px)" }, // 16 * 0.75
];

interface SizeOption {
  value: string;
  label: string;
}

interface FontSizeField {
  label?: string;
}

interface FontSizeRenderedProps {
  onChange: (value: string) => void;
  value: string;
  field: FontSizeField;
}

export const fontSizeRendered = (props: FontSizeRenderedProps) => {
  const {
    onChange,
    value,
    field: { label = "Size" },
  } = props;
  const options = useMemo((): SizeOption[] => {
    return !value
      ? sizeOptions
      : [
          ...sizeOptions,
          ...(sizeOptions.some((option) => option.value === value)
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
};

export const fontSizeField = {
  type: "custom" as const,
  label: "Font Size",
  render: fontSizeRendered,
};
