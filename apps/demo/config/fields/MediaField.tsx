"use client";

import type React from "react";

import { CustomFieldRender, FieldLabel, type FieldProps } from "@measured/puck";

import { ImageIcon, Video, X } from "lucide-react";
import { useEffect, useState } from "react";

export const MediaField: CustomFieldRender<string> = ({
  field,
  name,
  value,
  onChange,
  readOnly = false,
}) => {
  const [showFileManager, setShowFileManager] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          variant="outline"
          onClick={() => setShowFileManager(true)}
        >
          Select Images & Videos
        </button>
      </div>
    </>
  );
};
