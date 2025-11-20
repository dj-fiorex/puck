"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";

import { Search, Package, Star } from "lucide-react";
import { searchProducts } from "../lib/template-renderer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../app/app/_components/ui/popover";
import { Button } from "../../../../app/app/_components/ui/button";
import { Badge } from "../../../../app/app/_components/ui/badge";
import { Input } from "../../../../app/app/_components/ui/input";
import { Card, CardContent } from "../../../../app/app/_components/ui/card";

import { VirtualizedList } from "../../../../app/app/_components/ui/virtualized";

interface ProductSelectorProps {
  products?: any[];
  selectedProduct?: any;
  onProductSelect: (product: any) => void;
}

const ITEM_HEIGHT = 120; // Height of each product card
const CONTAINER_HEIGHT = 320; // Height of the scrollable container

export function ProductSelector({
  products = [],
  selectedProduct,
  onProductSelect,
}: ProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return searchProducts(products.flat(), searchQuery);
  }, [products, searchQuery]);

  const handleProductSelect = useCallback(
    (product: any) => {
      onProductSelect(product);
      setIsOpen(false);
      setSearchQuery("");
    },
    [onProductSelect]
  );

  const renderProductItem = useCallback(
    (product: any, index: number) => (
      <div className="h-full p-2">
        <Card
          className={`hover:bg-muted/50 h-full cursor-pointer py-1 transition-colors ${
            selectedProduct?.id === product.id ? "ring-primary ring-2" : ""
          }`}
          onClick={() => handleProductSelect(product)}
        >
          <CardContent className="flex h-full flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="truncate text-sm font-medium">{product.name}</h4>
                <Badge variant="outline" className="ml-2 flex-shrink-0 text-xs">
                  {product.sku}
                </Badge>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-muted-foreground line-clamp-2 text-xs">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    ${product.childProducts?.[0]?.price?.toFixed(2) ?? "0.00"}
                  </span>
                  <Badge
                    variant={
                      product.stock_item.min_sale_qty > 0
                        ? "default"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {product.stock_item.min_sale_qty > 0
                      ? "In Stock"
                      : "Out of Stock"}
                  </Badge>
                </div>
                {product.childProducts?.length && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-muted-foreground text-xs">
                      {product.childProducts.length} children
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    [selectedProduct?.id, handleProductSelect]
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Package className="mr-2 h-4 w-4" />
          {selectedProduct ? (
            <div className="flex items-center gap-2">
              <span className="font-medium">{selectedProduct.name}</span>
              {selectedProduct.sku && (
                <Badge variant="secondary" className="text-xs">
                  {selectedProduct.sku}
                </Badge>
              )}
            </div>
          ) : (
            "Select a product..."
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0"
        align="start"
        style={{ zIndex: 9999 }}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="border-b p-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              ref={searchInputRef}
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {filteredProducts.length > 0 && (
            <div className="text-muted-foreground mt-2 text-xs">
              {filteredProducts.length.toLocaleString()} products found
            </div>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <Package className="mx-auto mb-2 h-8 w-8" />
            <p>No products found</p>
          </div>
        ) : (
          <VirtualizedList
            items={filteredProducts}
            itemHeight={ITEM_HEIGHT}
            containerHeight={CONTAINER_HEIGHT}
            renderItem={renderProductItem}
            overscan={3}
            className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
