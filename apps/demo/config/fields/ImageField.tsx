"use client";

import type React from "react";
import { useState } from "react";
import { FieldLabel, type FieldProps } from "@/core";

export const ImageField: React.FC<
  FieldProps<string, string> & { accept: string }
> = ({
  field,
  name,
  value,
  accept = "image/png, image/jpeg",
  onChange,
  readOnly = false,
}) => {
  const [fileSrc, setFileSrc] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "image/png" || file.type === "image/jpeg") {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFileSrc(event.target?.result as string);
          onChange(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <FieldLabel label={field.label}>
      <input
        disabled={readOnly}
        id={`${name}-url`}
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mb-2 w-full rounded-md border px-3 py-2"
        placeholder="Enter image URL"
      />
      <input
        disabled={readOnly}
        id={`${name}-file`}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="w-full rounded-md border px-3 py-2"
      />
    </FieldLabel>
  );
};
