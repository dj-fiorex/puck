"use client";

import { Button } from "../../../../app/app/_components/ui/button";
import { Badge } from "../../../../app/app/_components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../app/app/_components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../app/app/_components/ui/dialog";
import { X, Package, Edit } from "lucide-react";
import { ProductSelector } from "./product-selector";

import { resolveTemplate, TemplateChip } from "../lib/template-renderer";
import { useState } from "react";

interface TemplateChipProps {
  products: any[];
  chip: TemplateChip;
  onRemove: (id: string) => void;
  onProductChange: (chipId: string, product: any) => void;
}

export function TemplateChipComponent({
  products,
  chip,
  onRemove,
  onProductChange,
}: TemplateChipProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const associatedProduct = chip.productId
    ? products.find((p) => p.id === chip.productId)
    : undefined;

  const requiresProduct =
    chip.template.includes("product.") ||
    chip.template.includes("stockStatus") ||
    chip.template.includes("ratingStars") ||
    chip.template.includes("formatCurrency product");

  const handleProductChange = (product: any) => {
    onProductChange(chip.id, product);
    setIsEditDialogOpen(false);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1">
            <Badge
              variant="outline"
              className="hover:bg-muted/50 cursor-pointer pr-1 transition-colors"
              role="listitem"
              aria-label={`Template ${chip.template} with value ${chip.value}`}
            >
              <span className="mr-1">{chip.template}</span>
              {requiresProduct && (
                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-blue-200"
                      aria-label={`Edit product for template ${chip.template}`}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Change Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg border p-3">
                        <div className="mb-1 text-sm font-medium">
                          Template:
                        </div>
                        <code className="text-xs">{chip.template}</code>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Select Product:
                        </label>
                        <ProductSelector
                          products={products}
                          selectedProduct={associatedProduct || products[0]}
                          onProductSelect={handleProductChange}
                        />
                      </div>

                      {associatedProduct && (
                        <div className="bg-muted/30 rounded-lg border p-3">
                          <div className="mb-1 text-sm font-medium">
                            Preview:
                          </div>
                          <div className="font-mono text-sm">
                            {resolveTemplate(chip.template, associatedProduct)}
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 p-0"
                onClick={() => onRemove(chip.id)}
                aria-label={`Remove template ${chip.template}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
            {associatedProduct && (
              <Badge variant="secondary" className="text-xs">
                <Package className="mr-1 h-3 w-3" />
                {associatedProduct.name}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs space-y-2 text-xs">
            <div>
              <div className="font-medium">Template:</div>
              <code className="text-xs">{chip.template}</code>
            </div>
            <div>
              <div className="font-medium">Resolved Value:</div>
              <div>{chip.value}</div>
            </div>
            {associatedProduct && (
              <div>
                <div className="font-medium">Associated Product:</div>
                <div>
                  {associatedProduct.name} ({associatedProduct.sku})
                </div>
              </div>
            )}
            <div className="text-muted-foreground">
              Position: {chip.startIndex}-{chip.endIndex}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
