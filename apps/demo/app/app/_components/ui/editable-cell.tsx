"use client";

import { Checkbox } from "@/app/_components/ui/checkbox";

import { Input } from "@/app/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Button } from "@/app/_components/ui/button";
import type { CellContext } from "@tanstack/react-table";

import { type JSX, useEffect, useState } from "react";

import * as Editable from "@/app/_components/ui/editable";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputList,
} from "@/app/_components/ui/tags-input";

export const EditableTagsArrayCell = <T extends object>({
  getValue,
  row,
  column: { id },
  table,
}: CellContext<T, string[]>): JSX.Element => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <TagsInput
      value={value}
      onValueChange={(val) => {
        console.log("onValueChange", val);
        table.options.meta?.updateData(row.original, id as keyof T, val);
        setValue(val);
      }}
      onValidate={(value) => value.length > 2 && !value.includes("ollie")}
      onInvalid={(newValue) =>
        value.length >= 6
          ? console.log("Up to 6 tricks are allowed.")
          : value.includes(newValue)
            ? console.log(`${newValue} already exists.`)
            : console.log(`${newValue} is not a valid trick.`)
      }
      max={6}
      editable
      addOnPaste
    >
      {/* <TagsInputLabel>Tricks</TagsInputLabel> */}
      <TagsInputList>
        {value?.map((trick) => (
          <TagsInputItem key={trick} value={trick}>
            {trick}
          </TagsInputItem>
        ))}
        <TagsInputInput placeholder="Add tag..." />
      </TagsInputList>
      <div className="text-muted-foreground text-sm">
        Add up to 6 tags with at least 3 characters, use "," to separate tags.
      </div>
    </TagsInput>
  );
};

export const EditableDoubleClickTextCell = <T extends object>({
  getValue,
  row,
  column: { id },
  table,
}: CellContext<T, string>): JSX.Element => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    table.options.meta?.updateData(row.original, id as keyof T, value);
  };

  return (
    // <div className="flex flex-col gap-4">
    <Editable.Root
      defaultValue={value}
      placeholder="Double click to edit"
      triggerMode="dblclick"
    >
      <Editable.Area>
        <Editable.Preview />
        <Editable.Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
        />
      </Editable.Area>
      <Editable.Toolbar>
        <Editable.Submit asChild>
          <Button size="sm" onClick={handleBlur}>
            Save
          </Button>
        </Editable.Submit>
        <Editable.Cancel asChild>
          <Button variant="outline" size="sm">
            Cancel
          </Button>
        </Editable.Cancel>
      </Editable.Toolbar>
    </Editable.Root>
    // </div>
  );
};

export const EditableTextCell = <T extends object>({
  getValue,
  row,
  column: { id },
  table,
}: CellContext<T, string>): JSX.Element => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    table.options.meta?.updateData(row.original, id as keyof T, value);
  };

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
    />
  );
};

export const EditableCheckboxCell = <T extends object>({
  getValue,
  row,
  column: { id },
  table,
}: CellContext<T, boolean>): JSX.Element => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = () => {
    const newValue = !value;
    setValue(newValue);
    table.options.meta?.updateData(row.original, id as keyof T, newValue);
  };

  return (
    <Checkbox
      className="h-8 w-8"
      checked={value}
      onCheckedChange={handleChange}
    />
  );
};

export const EditableSelectCell = <T extends object>({
  getValue,
  row,
  column,
  table,
  options,
}: CellContext<T, string> & {
  options: { label: string; value: string }[];
}) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);

  function handleChange(value: string) {
    setValue(value);
    console.log(row.index, column.id as keyof T, value);
    table.options.meta?.updateData(row.original, column.id as keyof T, value);
  }

  useEffect(() => setValue(initialValue), [initialValue]);

  return (
    <Select
      onValueChange={handleChange}
      value={value}
      defaultValue={value}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="select a value" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem value={option.value} key={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
