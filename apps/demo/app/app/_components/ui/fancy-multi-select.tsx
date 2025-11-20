"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Command as CommandPrimitive } from "cmdk";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";
import { Command, CommandGroup, CommandItem, CommandList } from "./command";
import { Badge } from "./badge";

export type FancySelectItem = {
  value: any;
  label: string;
};

interface FancyMultiSelectInterface {
  multiple: boolean;
  items: FancySelectItem[] | undefined;
  selected: string[];
  onValueChange?: (value: any[]) => void;
}

export function FancyMultiSelect({
  multiple,
  items,
  selected,
  onValueChange,
}: Readonly<FancyMultiSelectInterface>): React.JSX.Element {
  const initialSelectedItems =
    items?.filter((item) => selected.includes(item.value)) ?? [];

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [selectedItems, setSelectedItems] =
    React.useState<FancySelectItem[]>(initialSelectedItems);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = React.useCallback(
    (framework: FancySelectItem) => {
      setSelectedItems((prev) =>
        prev.filter((s) => s.value !== framework.value),
      );
    },
    [setSelectedItems],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            setSelectedItems((prev) => {
              const newSelected = [...prev];
              newSelected.pop();
              return newSelected;
            });
          }
        }
        // This is not a default behaviour of the <input /> field
        if (e.key === "Escape") {
          input.blur();
        }
      }
    },
    [setSelectedItems],
  );

  const selectables =
    items?.filter((framework) => {
      return !selectedItems
        .map((selectItem) => JSON.stringify(selectItem))
        .includes(JSON.stringify(framework));
    }) ?? [];

  useEffect(() => {
    if (onValueChange) {
      onValueChange(selectedItems.map((item) => item.value));
    }
  }, [onValueChange, selectedItems]);

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group border-input ring-offset-background focus-within:ring-ring rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selectedItems.map((item) => {
            return (
              <Badge key={uuidv4()} variant="secondary">
                {item.label}
                <button
                  className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(item);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(item)}
                >
                  <X className="text-muted-foreground hover:text-foreground h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={`Select ...`}
            className="placeholder:text-muted-foreground ml-2 flex-1 bg-transparent outline-none"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && selectables.length > 0 ? (
          <div className="bg-popover text-popover-foreground animate-in absolute top-0 z-10 w-full rounded-md border shadow-md outline-none">
            <CommandGroup className="h-full overflow-auto">
              <CommandList>
                {selectables.map((item) => {
                  return (
                    <CommandItem
                      key={uuidv4()}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        if (multiple) {
                          setInputValue("");
                          setSelectedItems((prev) => [...prev, item]);
                        } else {
                          setInputValue("");
                          setSelectedItems([item]);
                        }
                      }}
                      className={"cursor-pointer"}
                    >
                      {item.label}
                    </CommandItem>
                  );
                })}
              </CommandList>
            </CommandGroup>
          </div>
        ) : null}
      </div>
    </Command>
  );
}
