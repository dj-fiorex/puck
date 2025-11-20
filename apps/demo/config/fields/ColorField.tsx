"use client";

import type React from "react";
import { CustomFieldRender, FieldLabel } from "@measured/puck";
import { Button } from "../../app/app/_components/ui/button";
import { Delete } from "lucide-react";
import { ChromePicker, ColorResult } from "react-color";

export const ColorField: CustomFieldRender<string> = ({
  field,
  value,
  onChange,
}) => {
  const handleChange = (color: ColorResult) => {
    //console.log(color);
    const { r, g, b, a } = color.rgb;
    onChange(`rgba(${r}, ${g}, ${b}, ${a})`);
  };

  return (
    <FieldLabel label={field.label}>
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <ChromePicker color={value || "#000000"} onChange={handleChange} />
        </div>
        <Button
          onClick={(e) => {
            e.preventDefault();
            onChange("");
          }}
        >
          <Delete className="h-4 w-4" />
        </Button>
      </div>
    </FieldLabel>
  );
};
