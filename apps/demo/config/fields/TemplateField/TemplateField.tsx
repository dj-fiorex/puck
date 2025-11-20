"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "../../../app/app/_components/ui/button";

import { ProductSelector } from "./components/product-selector";

import {
  resolveTemplate,
  SavedTemplate,
  TemplateChip,
} from "./lib/template-renderer";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../../app/app/_components/ui/card";
import { MessageSquareWarning, Plus, Save, TriangleAlert } from "lucide-react";
import { TemplateInsertionDialog } from "./components/template-insertion-dialog";
import { TemplateChipComponent } from "./components/template-chip";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../app/app/_components/ui/alert-dialog";
import { EnvironmentConfiguration, Product } from "@tbd_ecommerce/skin-types";

interface TemplateTextEditorProps {
  initialTemplate?: SavedTemplate;
  onSave?: (template: SavedTemplate) => { success: boolean; message?: string };
  onBlur?: () => void;
  products?: Product[]; // Optional products prop to allow passing custom products
  environment: EnvironmentConfiguration;
}

export function TemplateTextEditor({
  initialTemplate,
  onSave,
  onBlur,
  environment,
  products = [], // Default to mock products if none provided
}: TemplateTextEditorProps) {
  const [content, setContent] = useState("");
  const [chips, setChips] = useState<TemplateChip[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  // First, add a new state variable to track pending templates that need product selection
  // Add this after the other state declarations
  // Add this after the other state declarations
  const [pendingTemplate, setPendingTemplate] = useState<{
    template: string;
    startPos: number;
    endPos: number;
  } | null>(null);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  // Initialize with template data if provided
  useEffect(() => {
    if (initialTemplate) {
      setContent(initialTemplate.content ?? "");
      setChips(initialTemplate.chips ?? []);
    }
  }, [initialTemplate]);

  // Function to validate if cursor position is within a chip
  const getCursorChip = (position: number): TemplateChip | null => {
    return (
      chips.find(
        (chip) => position > chip.startIndex && position < chip.endIndex
      ) || null
    );
  };

  // Update the detectAndConvertTemplates function to handle product templates differently
  // Replace the existing detectAndConvertTemplates function with this updated version:

  // Function to detect and convert handlebars templates in content
  const detectAndConvertTemplates = useCallback(
    (newContent: string, cursorPos: number) => {
      // Find all handlebars templates in the content
      const templateRegex = /\{\{[^{}]+\}\}/g;
      const matches = Array.from(newContent.matchAll(templateRegex));

      if (matches.length === 0) {
        return { content: newContent, chips: chips };
      }

      let updatedContent = newContent;
      let updatedChips = [...chips];
      let pendingProductTemplate = null;

      // Process matches from end to beginning to maintain correct positions
      for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        const templateText = match[0];
        const startPos = match.index!;
        const endPos = startPos + templateText.length;

        // Check if this template overlaps with existing chips
        const overlappingChip = updatedChips.find(
          (chip) =>
            (startPos >= chip.startIndex && startPos < chip.endIndex) ||
            (endPos > chip.startIndex && endPos <= chip.endIndex) ||
            (startPos <= chip.startIndex && endPos >= chip.endIndex)
        );

        // Only convert if it doesn't overlap with existing chips
        if (!overlappingChip) {
          // Check if this is a product-related template
          const requiresProduct =
            templateText.includes("product.") ||
            templateText.includes("stockStatus") ||
            templateText.includes("ratingStars") ||
            templateText.includes("formatCurrency product");

          if (requiresProduct) {
            // Store this as a pending template and open product selector
            pendingProductTemplate = {
              template: templateText,
              startPos,
              endPos,
            };
            break; // Process one template at a time for product selection
          } else {
            // For non-product templates, process as before
            const resolvedValue = resolveTemplate(templateText);

            // Create new chip
            const newChip: TemplateChip = {
              id: Math.random().toString(36).substr(2, 9),
              template: templateText,
              value: resolvedValue,
              startIndex: startPos,
              endIndex: startPos + resolvedValue.length,
            };

            // Replace template with resolved value in content
            updatedContent =
              updatedContent.slice(0, startPos) +
              resolvedValue +
              updatedContent.slice(endPos);

            // Adjust positions of existing chips that come after this position
            updatedChips = updatedChips.map((chip) => {
              if (chip.startIndex >= endPos) {
                const adjustment = resolvedValue.length - templateText.length;
                return {
                  ...chip,
                  startIndex: chip.startIndex + adjustment,
                  endIndex: chip.endIndex + adjustment,
                };
              }
              return chip;
            });

            // Add the new chip
            updatedChips.push(newChip);
          }
        }
      }

      // If we found a product template, set it as pending and trigger product selection
      if (pendingProductTemplate) {
        setPendingTemplate(pendingProductTemplate);
        setIsProductSelectorOpen(true);
        return { content: newContent, chips: chips }; // Return original content until product is selected
      }

      // Sort chips by position
      updatedChips.sort((a, b) => a.startIndex - b.startIndex);

      return { content: updatedContent, chips: updatedChips };
    },
    [chips]
  );

  // Enhanced text change handler with template detection
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    const lengthDiff = newContent.length - content.length;

    // If no length difference, it's just cursor movement
    if (lengthDiff === 0) {
      setContent(newContent);
      return;
    }

    // Check if user is trying to edit within a chip
    const chipAtCursor = chips.find((chip) => {
      if (lengthDiff > 0) {
        // For insertions, check if cursor is within chip bounds
        return cursorPos > chip.startIndex && cursorPos <= chip.endIndex;
      } else {
        // For deletions, check if deletion affects chip content
        const deleteStart = cursorPos;
        const deleteEnd = cursorPos - lengthDiff;
        return (
          (deleteStart > chip.startIndex && deleteStart < chip.endIndex) ||
          (deleteEnd > chip.startIndex && deleteEnd < chip.endIndex) ||
          (deleteStart <= chip.startIndex && deleteEnd >= chip.endIndex)
        );
      }
    });

    if (chipAtCursor) {
      // Prevent editing within chips - revert to last valid state
      e.target.value = content;
      e.target.setSelectionRange(
        cursorPos - lengthDiff,
        cursorPos - lengthDiff
      );
      return;
    }

    // Check if user just completed a handlebars template (typed '}' to complete '}}')
    const justCompletedTemplate =
      lengthDiff > 0 &&
      newContent.slice(cursorPos - lengthDiff, cursorPos).includes("}");

    if (justCompletedTemplate) {
      // Detect and convert any new handlebars templates
      const result = detectAndConvertTemplates(newContent, cursorPos);
      setContent(result.content);
      setChips(result.chips);

      // Adjust cursor position if content changed
      const contentLengthDiff = result.content.length - newContent.length;
      if (contentLengthDiff !== 0) {
        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPos = cursorPos + contentLengthDiff;
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 0);
      }
    } else {
      // Regular text change - update chip positions
      const changePosition = cursorPos - (lengthDiff > 0 ? lengthDiff : 0);

      const updatedChips = chips.map((chip) => {
        if (chip.startIndex >= changePosition) {
          return {
            ...chip,
            startIndex: chip.startIndex + lengthDiff,
            endIndex: chip.endIndex + lengthDiff,
          };
        }
        return chip;
      });

      setContent(newContent);
      setChips(updatedChips);
    }
  };

  // Handle keyboard events for better UX
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const cursorPos = e.currentTarget.selectionStart;
    const chipAtCursor = getCursorChip(cursorPos);

    // Prevent certain keys within chips
    if (
      chipAtCursor &&
      (e.key === "Backspace" || e.key === "Delete" || e.key.length === 1)
    ) {
      e.preventDefault();
      return;
    }

    // Handle backspace at chip boundaries
    if (e.key === "Backspace" && cursorPos > 0) {
      const chipEndingAtCursor = chips.find(
        (chip) => chip.endIndex === cursorPos
      );
      if (chipEndingAtCursor) {
        e.preventDefault();
        removeChip(chipEndingAtCursor.id);
        return;
      }
    }

    // Handle delete at chip boundaries
    if (e.key === "Delete") {
      const chipStartingAtCursor = chips.find(
        (chip) => chip.startIndex === cursorPos
      );
      if (chipStartingAtCursor) {
        e.preventDefault();
        removeChip(chipStartingAtCursor.id);
        return;
      }
    }
  };

  // Handle save action
  const handleSave = async () => {
    if (onSave) {
      const res = await onSave({
        content,
        chips,
      });
      if (!res) return;
      if (!res.success) {
        setSaveWarning(res.message || "Failed to save template.");
      } else {
        setSaveWarning(null);
      }
    }
  };

  const removeChip = (id: string) => {
    setChips((prevChips) => {
      const chipToRemove = prevChips.find((chip) => chip.id === id);
      if (!chipToRemove) return prevChips;

      const updatedChips = prevChips.filter((chip) => chip.id !== id);
      const diff = chipToRemove.endIndex - chipToRemove.startIndex;

      // Adjust content
      const contentBefore = content.substring(0, chipToRemove.startIndex);
      const contentAfter = content.substring(chipToRemove.endIndex);
      const newContent = contentBefore + contentAfter;
      setContent(newContent);

      // Adjust chip positions
      const adjustedChips = updatedChips.map((chip) => {
        if (chip.startIndex > chipToRemove.startIndex) {
          return {
            ...chip,
            startIndex: chip.startIndex - diff,
            endIndex: chip.endIndex - diff,
          };
        }
        return chip;
      });

      return adjustedChips;
    });
  };

  const insertTemplate = (templateKey: string, product?: Product) => {
    const resolvedValue = resolveTemplate(templateKey, product);
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const newContent =
      content.substring(0, cursorPos) +
      resolvedValue +
      content.substring(cursorPos);

    const newChip: TemplateChip = {
      id: Math.random().toString(36).substr(2, 9),
      template: templateKey,
      value: resolvedValue,
      startIndex: cursorPos,
      endIndex: cursorPos + resolvedValue.length,
      productId: product?.id,
    };

    const updatedChips =
      chips?.map((chip) => {
        if (chip.startIndex >= cursorPos) {
          return {
            ...chip,
            startIndex: chip.startIndex + resolvedValue.length,
            endIndex: chip.endIndex + resolvedValue.length,
          };
        }
        return chip;
      }) ?? [];

    setChips(
      [...updatedChips, newChip].sort((a, b) => a.startIndex - b.startIndex)
    );
    setContent(newContent);

    // Adjust cursor position after inserting the template
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = cursorPos + resolvedValue.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleProductChange = (chipId: string, product: Product) => {
    setChips((prevChips) => {
      const updatedChips = prevChips.map((chip) => {
        if (chip.id === chipId) {
          const newValue = resolveTemplate(chip.template, product);
          const lengthDiff = newValue.length - chip.value.length;

          // Update content
          const contentBefore = content.substring(0, chip.startIndex);
          const contentAfter = content.substring(chip.endIndex);
          const newContent = contentBefore + newValue + contentAfter;
          setContent(newContent);

          return {
            ...chip,
            value: newValue,
            endIndex: chip.endIndex + lengthDiff,
            productId: product.id,
          };
        }
        // Adjust positions of chips that come after the updated chip
        if (
          chip.startIndex > prevChips.find((c) => c.id === chipId)!.startIndex
        ) {
          const updatedChip = prevChips.find((c) => c.id === chipId)!;
          const newValue = resolveTemplate(updatedChip.template, product);
          const lengthDiff = newValue.length - updatedChip.value.length;

          return {
            ...chip,
            startIndex: chip.startIndex + lengthDiff,
            endIndex: chip.endIndex + lengthDiff,
          };
        }
        return chip;
      });

      return updatedChips;
    });
  };

  // Add a function to handle product selection for pending templates
  // Add this function after handleProductChange

  const handlePendingTemplateProductSelect = (product: Product) => {
    if (!pendingTemplate) return;

    const { template, startPos, endPos } = pendingTemplate;
    const resolvedValue = resolveTemplate(template, product);

    // Create new chip
    const newChip: TemplateChip = {
      id: Math.random().toString(36).substr(2, 9),
      template,
      value: resolvedValue,
      startIndex: startPos,
      endIndex: startPos + resolvedValue.length,
      productId: product.id,
    };

    // Update content by replacing the template with its resolved value
    const newContent =
      content.substring(0, startPos) +
      resolvedValue +
      content.substring(endPos);

    // Adjust positions of existing chips that come after this position
    const updatedChips = chips.map((chip) => {
      if (chip.startIndex >= endPos) {
        const adjustment = resolvedValue.length - (endPos - startPos);
        return {
          ...chip,
          startIndex: chip.startIndex + adjustment,
          endIndex: chip.endIndex + adjustment,
        };
      }
      return chip;
    });

    // Add the new chip and sort
    const newChips = [...updatedChips, newChip].sort(
      (a, b) => a.startIndex - b.startIndex
    );

    // Update state
    setContent(newContent);
    setChips(newChips);
    setPendingTemplate(null);
    setIsProductSelectorOpen(false);
  };

  // Add a function to cancel pending template selection
  // Add this function after handlePendingTemplateProductSelect

  const cancelPendingTemplate = () => {
    setPendingTemplate(null);
    setIsProductSelectorOpen(false);
  };

  // Create template data for preview with all associated products

  return (
    <div
      className="mx-auto max-w-4xl"
      role="main"
      aria-label="Template Text Editor"
    >
      {/* Editor Section */}
      <Card className="border-none p-0 shadow-none">
        <CardHeader className="p-0">
          <div className="flex items-center justify-between gap-4">
            <TemplateInsertionDialog
              onInsert={insertTemplate}
              products={products}
              environment={environment}
            >
              <Button size="sm" variant="outline" aria-label="Add new template">
                <Plus className="mr-2 h-4 w-4" />
                Add Template
              </Button>
            </TemplateInsertionDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          {/* Enhanced text input */}
          <div className="space-y-2">
            <label htmlFor="content-textarea" className="text-sm font-medium">
              Template Content:
            </label>
            <textarea
              id="content-textarea"
              ref={textareaRef}
              value={content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your content here..."
              className="focus:ring-ring min-h-[120px] w-full resize-none rounded-md border p-3 focus:border-transparent focus:ring-2 focus:outline-none"
              aria-describedby="content-help"
              aria-label="Content editor with template support"
              onBlur={() => {
                //console.log("on blur");
                if (onBlur) onBlur();
              }}
            />
            <div id="content-help" className="text-muted-foreground text-xs">
              Use the "Add Template" button to insert dynamic content or type
              handlebars directly (e.g., {`{{product.name}}`}). Each template
              can be associated with a different product.
            </div>
          </div>

          {/* Enhanced active templates section */}
          {chips?.length > 0 && (
            <div
              className="space-y-2"
              role="region"
              aria-label="Active templates"
            >
              <label className="text-sm font-medium">
                Active Templates ({chips.length}):
              </label>
              <div className="flex flex-wrap gap-2" role="list">
                {chips.map((chip) => (
                  <TemplateChipComponent
                    products={products}
                    key={chip.id}
                    chip={chip}
                    onRemove={removeChip}
                    onProductChange={handleProductChange}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex border-t px-0 pt-4">
          <Button onClick={handleSave} className="">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          {saveWarning && (
            <div className="ml-4 flex items-center">
              <TriangleAlert className="mr-2 h-13 w-13 text-yellow-500" />
              <span className="text-sm text-yellow-600">{saveWarning}</span>
            </div>
          )}
        </CardFooter>
      </Card>
      {isProductSelectorOpen && pendingTemplate && (
        <AlertDialog
          open={isProductSelectorOpen}
          onOpenChange={setIsProductSelectorOpen}
        >
          <AlertDialogContent className="max-w-md">
            <AlertDialogDescription>
              Please select a product for the template below. This will allow
              you to dynamically insert product-specific data into your
              template.
            </AlertDialogDescription>
            <AlertDialogHeader>
              <AlertDialogTitle>Select Product for Template</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="mb-2 text-sm font-medium">Template:</div>
                <code className="text-xs">{pendingTemplate.template}</code>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Product:</label>
                <ProductSelector
                  products={products}
                  selectedProduct={products[0]}
                  onProductSelect={handlePendingTemplateProductSelect}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={cancelPendingTemplate}>
                  Cancel
                </Button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
