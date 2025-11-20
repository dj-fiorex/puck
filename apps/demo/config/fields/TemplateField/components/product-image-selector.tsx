"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "../../../../app/app/_components/ui/button";
import { Badge } from "../../../../app/app/_components/ui/badge";
import { Card, CardContent } from "../../../../app/app/_components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../app/app/_components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../../../app/app/_components/ui/radio-group";
import { Label } from "../../../../app/app/_components/ui/label";
import { Checkbox } from "../../../../app/app/_components/ui/checkbox";
import { ScrollArea } from "../../../../app/app/_components/ui/scroll-area";
import { ImageIcon, Hash, Tag } from "lucide-react";
import type { MediaGalleryEntry } from "../lib/template-renderer";
import {
  getUniqueImageTypes,
  filterImagesByTypes,
} from "../lib/template-renderer";

interface ProductImageSelectorProps {
  product: any;
  onImageSelect: (template: string) => void;
  children: React.ReactNode;
  environment: any;
}

type SelectionMethod = "index" | "types";

export function ProductImageSelector({
  product,
  onImageSelect,
  children,
  environment,
}: ProductImageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectionMethod, setSelectionMethod] =
    useState<SelectionMethod>("index");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const { magentoMediaUrl, frontendUrl } = environment ?? {};

  const uniqueTypes = getUniqueImageTypes(product);
  const filteredImages =
    selectionMethod === "types"
      ? filterImagesByTypes(product, selectedTypes)
      : product.media_gallery_entries;

  const handleTypeToggle = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    }
  };

  const handleImageSelect = (image: MediaGalleryEntry, index: number) => {
    if (selectionMethod === "index") {
      const originalIndex = product.media_gallery_entries.findIndex(
        (entry) => entry.id === image.id
      );
      const template = `{{productImageByIndex product.media_gallery_entries ${originalIndex}}}`;
      onImageSelect(template);
    } else {
      // For types selection, create a template with the selected types
      const typesString = selectedTypes.map((type) => `"${type}"`).join(" ");
      const template = `{{productImageByTypes product.media_gallery_entries ${typesString}}}`;
      onImageSelect(template);
    }
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedTypes([]);
    setSelectedImageIndex(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Select Product Image - {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selection Method */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              How do you want to select the image?
            </Label>
            <RadioGroup
              value={selectionMethod}
              onValueChange={(value) =>
                setSelectionMethod(value as SelectionMethod)
              }
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="index" id="index" />
                <Label htmlFor="index" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  By Index (position in array)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="types" id="types" />
                <Label htmlFor="types" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  By Types (image categories)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Types Selection */}
          {selectionMethod === "types" && uniqueTypes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Image Types:</Label>
              <div className="flex flex-wrap gap-3">
                {uniqueTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={(checked) =>
                        handleTypeToggle(type, checked as boolean)
                      }
                    />
                    <Label htmlFor={type} className="text-sm">
                      <Badge variant="outline">{type}</Badge>
                    </Label>
                  </div>
                ))}
              </div>
              {selectedTypes.length > 0 && (
                <div className="text-muted-foreground text-sm">
                  Selected types: {selectedTypes.join(", ")}
                </div>
              )}
            </div>
          )}

          {/* Images Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {selectionMethod === "index" ? "All Images" : "Filtered Images"}
                {filteredImages.length > 0 && (
                  <span className="text-muted-foreground ml-2">
                    ({filteredImages.length} image
                    {filteredImages.length !== 1 ? "s" : ""})
                  </span>
                )}
              </Label>
              {selectionMethod === "index" && (
                <div className="text-muted-foreground text-xs">
                  Click an image to select by its array index
                </div>
              )}
            </div>

            <ScrollArea className="h-96">
              {filteredImages.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
                  <ImageIcon className="mb-4 h-12 w-12" />
                  <p>
                    {selectionMethod === "types" && selectedTypes.length === 0
                      ? "Select image types to see filtered images"
                      : "No images found"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {filteredImages.map((image, index) => {
                    const originalIndex =
                      product.media_gallery_entries.findIndex(
                        (entry) => entry.id === image.id
                      );
                    return (
                      <Card
                        key={image.id}
                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleImageSelect(image, index)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Image Preview */}
                            <div className="bg-muted flex aspect-square items-center justify-center rounded-lg">
                              <div className="text-center">
                                <img
                                  src={`${magentoMediaUrl}${image.file}`}
                                  alt={image.label || "Product Image"}
                                  className="mx-auto max-h-24 object-contain"
                                />

                                <div className="text-muted-foreground font-mono text-xs">
                                  {image.file.split("/").pop()}
                                </div>
                              </div>
                            </div>

                            {/* Image Info */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                  Index: {originalIndex}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Pos: {image.position}
                                </Badge>
                              </div>

                              {image.label && (
                                <div className="truncate text-xs font-medium">
                                  {image.label}
                                </div>
                              )}

                              {image.types.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {image.types.map((type) => (
                                    <Badge
                                      key={type}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {type}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              <div className="text-muted-foreground truncate font-mono text-xs">
                                {image.file}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {selectionMethod === "types" &&
              selectedTypes.length > 0 &&
              filteredImages.length > 0 && (
                <Button onClick={() => handleImageSelect(filteredImages[0], 0)}>
                  Use First Matching Image
                </Button>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
