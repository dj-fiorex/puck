"use client";

import { Button } from "../../../../app/app/_components/ui/button";
import { Badge } from "../../../../app/app/_components/ui/badge";

import { ProductSelector } from "./product-selector";

import { availableTemplates, resolveTemplate } from "../lib/template-renderer";
import { useState } from "react";
import { ScrollArea } from "../../../../app/app/_components/ui/scroll-area";
import { ArrowRight, CrossIcon, ImageIcon } from "lucide-react";
import { Separator } from "../../../../app/app/_components/ui/separator";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "../../../../app/app/_components/ui/alert-dialog";
import { ProductImageSelector } from "./product-image-selector";

interface TemplateInsertionDialogProps {
  products: any[];
  onInsert: (template: string, product?: any) => void;
  children: React.ReactNode;
}

export function TemplateInsertionDialog({
  onInsert,
  children,
  products,
  environment,
}: TemplateInsertionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(products[0]);
  const [step, setStep] = useState<"template" | "product" | "image">(
    "template"
  );

  const groupedTemplates = availableTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof availableTemplates>);

  const handleTemplateSelect = (templateKey: string) => {
    const template = availableTemplates.find((t) => t.key === templateKey);
    setSelectedTemplate(templateKey);

    if (template?.requiresProduct) {
      setStep("product");
    } else {
      // Insert immediately for non-product templates
      onInsert(templateKey);
      handleClose();
    }
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
  };

  const handleProductConfirm = () => {
    const template = availableTemplates.find((t) => t.key === selectedTemplate);

    if (template?.requiresImageSelection) {
      setStep("image");
    } else {
      handleInsert();
    }
  };

  const handleImageSelect = (imageTemplate: string) => {
    onInsert(imageTemplate, selectedProduct);
    handleClose();
  };

  const handleInsert = () => {
    if (selectedTemplate) {
      const template = availableTemplates.find(
        (t) => t.key === selectedTemplate
      );
      onInsert(
        selectedTemplate,
        template?.requiresProduct ? selectedProduct : undefined
      );
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedTemplate(null);
    setStep("template");
  };

  const selectedTemplateInfo = availableTemplates.find(
    (t) => t.key === selectedTemplate
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl sm:max-w-4xl">
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle>
              {step === "template" && "Select Template"}
              {step === "product" && "Select Product"}
              {step === "image" && "Select Product Image"}
              {selectedTemplateInfo && step === "product" && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-sm">
                    {selectedTemplateInfo.label}
                  </Badge>
                </div>
              )}
            </AlertDialogTitle>
            <AlertDialogCancel>
              <CrossIcon className="rotate-45" />
            </AlertDialogCancel>
          </div>
        </AlertDialogHeader>

        {step === "template" && (
          <div className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {Object.entries(groupedTemplates).map(
                  ([category, templates]) => (
                    <div key={category}>
                      <h5 className="text-muted-foreground mb-3 text-sm font-medium">
                        {category}
                      </h5>
                      <div className="grid gap-2">
                        {templates.map((template) => (
                          <Button
                            key={template.key}
                            variant="ghost"
                            size="sm"
                            className="h-auto w-full justify-between p-3 text-left"
                            onClick={() => handleTemplateSelect(template.key)}
                          >
                            <div className="flex flex-1 items-center gap-2">
                              <div>
                                <div className="font-medium">
                                  {template.label}
                                </div>
                                {!template.requiresImageSelection && (
                                  <code className="text-muted-foreground text-xs">
                                    {template.key}
                                  </code>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {template.requiresProduct && (
                                <Badge variant="secondary" className="text-xs">
                                  Requires Product
                                </Badge>
                              )}
                              {template.requiresImageSelection && (
                                <Badge variant="secondary" className="text-xs">
                                  Image Selection
                                </Badge>
                              )}
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </Button>
                        ))}
                      </div>
                      {category !==
                        Object.keys(groupedTemplates).slice(-1)[0] && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  )
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {step === "product" && selectedTemplateInfo && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg border p-4">
              <div className="mb-2 text-sm font-medium">Selected Template:</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedTemplateInfo.label}</Badge>
                {!selectedTemplateInfo.requiresImageSelection && (
                  <code className="text-muted-foreground text-xs">
                    {selectedTemplateInfo.key}
                  </code>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Product:</label>
              <ProductSelector
                products={products}
                selectedProduct={selectedProduct}
                onProductSelect={handleProductSelect}
              />
            </div>

            {!selectedTemplateInfo.requiresImageSelection && (
              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="mb-2 text-sm font-medium">Preview:</div>
                <div className="font-mono text-sm">
                  {resolveTemplate(selectedTemplateInfo.key, selectedProduct)}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("template")}>
                Back
              </Button>
              <Button onClick={handleProductConfirm}>
                {selectedTemplateInfo.requiresImageSelection
                  ? "Next: Select Image"
                  : "Insert Template"}
              </Button>
            </div>
          </div>
        )}

        {step === "image" && selectedTemplateInfo && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg border p-4">
              <div className="mb-2 text-sm font-medium">Selected:</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedTemplateInfo.label}</Badge>
                <Badge variant="secondary">{selectedProduct.name}</Badge>
              </div>
            </div>

            <div className="text-center">
              <ProductImageSelector
                product={selectedProduct}
                environment={environment}
                onImageSelect={handleImageSelect}
              >
                <Button size="lg" className="w-full">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Select Product Image
                </Button>
              </ProductImageSelector>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("product")}>
                Back
              </Button>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
