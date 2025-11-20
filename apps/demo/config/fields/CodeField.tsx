"use client";

import type React from "react";
import { CustomFieldRender, FieldLabel, Button } from "@measured/puck";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ConstrainedEditor from "./ConstrainedEditor";

export const CodeField: CustomFieldRender<string> = ({
  field,
  value,
  onChange,
}) => {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const { metadata, label = "Code Editor" } = field;

  const { editorSettings, descriptionCmp: DescriptionComponent } =
    metadata ?? {};
  const {
    height = "400px",
    defaultLanguage = "javascript",
    theme = "vs-dark",
    savingText = "Saving...",
    saveText = "Save",
    prefix = "",
    suffix = "",
    getFullValue = false,
  } = editorSettings ?? {};

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsSubmitting(true);

    onChange(currentValue);

    setIsSubmitting(false);
  };

  const valueNotPrefixed = getFullValue
    ? currentValue.slice(prefix.length, currentValue.length - suffix.length)
    : currentValue;

  return (
    <FieldLabel label={label}>
      {DescriptionComponent && <DescriptionComponent />}
      <ConstrainedEditor
        height={height}
        theme={theme}
        prefix={prefix}
        suffix={suffix}
        language={defaultLanguage}
        defaultContent={valueNotPrefixed ?? ""}
        onChange={(full, editable) => {
          if (getFullValue) {
            setCurrentValue(full);
            return;
          }
          setCurrentValue(editable);
        }}
      />
      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {savingText}
          </>
        ) : (
          saveText
        )}
      </Button>
    </FieldLabel>
  );
};
