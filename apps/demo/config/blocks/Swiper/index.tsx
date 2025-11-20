import { FieldLabel, type ComponentConfig } from "@measured/puck";
import { Button } from "../../../app/app/_components/ui/button";
import { v4 as uuidv4 } from "uuid";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../app/app/_components/ui/dialog";
import { Label } from "../../../app/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../app/app/_components/ui/select";
import { useState } from "react";
import { CodeField } from "../../fields/CodeField";
import { withExport } from "../../decorators/withExport";
import { withAdminLayout } from "../../decorators/withAdminLayout";
import { withLayout } from "../../decorators/withLayout";
import { SwiperSliderProps, SwiperSliderRender } from "./swiper";

function substituteProductIdInChips(items: any[], productId: number): any[] {
  // console.log.log("Substituting productId in chips: ", productId, items);
  return items.map((item) => {
    // Clone the item to avoid mutating the original
    const newItem = JSON.parse(JSON.stringify(item));

    // Replace id with a new UUID if present
    if (newItem.props && typeof newItem.props.id === "string") {
      newItem.props.id = uuidv4();
    }

    // Iterate over each prop
    if (newItem.props) {
      for (const key in newItem.props) {
        if (newItem.props.hasOwnProperty(key)) {
          const prop = newItem.props[key];
          // If the prop is an object and has chips
          if (prop && typeof prop === "object" && prop.chips) {
            prop.chips = prop.chips.map((chip: any) => {
              if (chip.hasOwnProperty("productId")) {
                return { ...chip, productId };
              }
              return chip;
            });
          }
        }
      }
      // If the item has nested items, recurse into them
      if (newItem.props.items && Array.isArray(newItem.props.items)) {
        newItem.props.items = substituteProductIdInChips(
          newItem.props.items,
          productId
        );
      }
    }
    return newItem;
  });
}

const categoryIdForAutoFill = (categoriesWithCount: any) => ({
  type: "custom",
  label: "Auto Fill Slides with category products",
  render: (props) => {
    const { onChange, value } = props;

    const [selectedCategory, setSelectedCategory] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
      <FieldLabel label="Auto-Fill Slides from Category">
        <Button
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!value) {
              setIsDialogOpen(true);
            } else {
              // Clear selected category
              onChange("");
            }
          }}
        >
          {value
            ? `Selected Category: ${value}`
            : "Auto-Fill Slides from Category"}
        </Button>

        {isDialogOpen && (
          <Dialog
            open={true}
            onOpenChange={(val) => {
              setIsDialogOpen(val);
            }}
          >
            <DialogContent className="max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Select Category</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-4">
                  <Label>Compile carousel with products from category</Label>

                  <div className="">
                    <Label className="text-base font-medium">Category</Label>

                    <Select
                      value={selectedCategory}
                      onValueChange={(value) => setSelectedCategory(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>

                      <SelectContent>
                        {categoriesWithCount.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name} - ID: {category.id} - Products:{" "}
                            {category.productCount}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDialogOpen(false);
                    onChange(selectedCategory);
                    setSelectedCategory("");
                  }}
                >
                  Compile
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </FieldLabel>
    );
  },
});

const maxSlidesToAutoFill = {
  type: "number",
  label: "Max number of slides to auto-fill (0 = all products)",
  defaultValue: 5,
  min: 0,
  step: 1,
};

const deleteAllButFirstSlide = {
  type: "custom",
  label: "Delete all but first slide",
  render: (props) => {
    const { onChange } = props;

    return (
      <Button
        variant="destructive"
        onClick={(e) => {
          console.log("Deleting all but first slide");
          e.preventDefault();
          e.stopPropagation();
          onChange(true);
        }}
      >
        Delete all but first slide
      </Button>
    );
  },
};

const externalSourceForAutoFill = {
  type: "custom",
  label: "Auto Fill Slides with external source",
  render: (props) => {
    const { onChange } = props;

    const [selectedSource, setSelectedSource] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
      <>
        <Button
          variant="outline"
          onClick={() => {
            setIsDialogOpen(true);
          }}
        >
          Auto-Fill Slides from External Source
        </Button>

        {isDialogOpen && (
          <Dialog
            open={true}
            onOpenChange={(val) => {
              setIsDialogOpen(val);
            }}
          >
            <DialogContent className="max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Select Source</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-4">
                  <Label>Compile carousel with External Source</Label>

                  <div className="">
                    <Label className="text-base font-medium">Source</Label>

                    <Select
                      value={selectedSource}
                      onValueChange={(value) => setSelectedSource(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Source" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem
                          key={"recentlyViewed"}
                          value={"recentlyViewed"}
                        >
                          Recently viewed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDialogOpen(false);
                    // console.log.log("Selected Source: ", selectedSource);
                    onChange(selectedSource);
                    setSelectedSource("");
                  }}
                >
                  Compile
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  },
};

const swiperFields = {
  id: {
    type: "text",
    label: "Swiper ID - Unique identifier for the swiper component",
  },
  slidesObj: {
    type: "array",
    label: "Slides - Array of slide objects containing items",
    defaultItemProps: {
      items: [],
    },
    arrayFields: {
      items: {
        type: "slot",
        label: "Items - Content elements within each slide",
      },
    },
  },
  current: {
    label: "Current slide index - Initial slide to display (0-based)",
    type: "number",
    min: 0,
  },
  slidesPerPage: {
    label: "Slides per page - Number of slides visible at once",
    type: "number",
    min: 1,
    step: 0.1,
  },
  spaceBetween: {
    label: "Space Between Slides - Gap between slides in pixels",
    type: "number",
    min: 0,
  },
  hideOnDesktop: {
    type: "radio",
    label: "Hide on Desktop - Whether to hide swiper on desktop devices",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  hideOnMobile: {
    type: "radio",
    label: "Hide on Mobile - Whether to hide swiper on mobile devices",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  hideOnTablet: {
    type: "radio",
    label: "Hide on Tablet - Whether to hide swiper on tablet devices",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  loop: {
    label: "Loop back to start - Enable continuous loop mode",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  autoHeight: {
    label: "Auto Height - Adjust height based on active slide content",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  speed: {
    type: "number",
    label: "Slide Speed (ms) - Transition duration in milliseconds",
  },
  autoplay: {
    type: "object",
    label: "Autoplay - Automatic slide progression settings",
    objectFields: {
      enabled: {
        type: "radio",
        label: "Enabled - Turn autoplay on or off",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      delay: {
        type: "number",
        label: "Delay - Time between slide transitions in milliseconds",
      },
      disableOnInteraction: {
        type: "radio",
        label: "Disable on Interaction - Stop autoplay after user interaction",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  navigation: {
    type: "object",
    label: "Navigation - Arrow buttons configuration",
    objectFields: {
      enabled: {
        type: "radio",
        label: "Enabled - Show navigation arrows",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      placement: {
        type: "radio",
        label: "Placement - Position of navigation arrows",
        options: [
          { label: "Outside", value: "outside" },
          { label: "Inside", value: "inside" },
          { label: "Bottom", value: "bottom" },
          { label: "Bottom Left", value: "bottom-left" },
          { label: "Bottom Right", value: "bottom-right" },
        ],
      },
    },
  },
  pagination: {
    type: "object",
    label: "Pagination - Slide indicators configuration",
    objectFields: {
      enabled: {
        type: "radio",
        label: "Enabled - Show pagination bullets/indicators",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      type: {
        type: "radio",
        label: "Type - Style of pagination indicators",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Dynamic", value: "dynamic" },
          { label: "Progress", value: "progress" },
        ],
      },
      paginationProgressCss: {
        type: "custom",
        label: "Pagination Progress CSS - Custom styles for type progress",
        render: CodeField,
        metadata: {
          editorSettings: {
            height: "200px",
            defaultLanguage: "css",
            theme: "vs-dark",
            savingText: "Saving...",
            saveText: "Save",
            prefix: `.swiper-pagination-progressbar {`,
            suffix: `}`,
          },
        },
      },
      paginationProgressFillCss: {
        type: "custom",
        label:
          "Pagination Progress Fill CSS - Custom styles of enabled bar for type progress",
        render: CodeField,
        metadata: {
          editorSettings: {
            height: "200px",
            defaultLanguage: "css",
            theme: "vs-dark",
            savingText: "Saving...",
            saveText: "Save",
            prefix: `.swiper-pagination-custom {`,
            suffix: `}`,
          },
        },
      },
      bulletsContainerCss: {
        type: "custom",
        label: "Bullets Container CSS - Custom styles for pagination container",
        render: CodeField,
        metadata: {
          editorSettings: {
            height: "200px",
            defaultLanguage: "css",
            theme: "vs-dark",
            savingText: "Saving...",
            saveText: "Save",
            prefix: `.swiper-pagination-custom {`,
            suffix: `}`,
          },
        },
      },
      bulletsCss: {
        type: "custom",
        label: "Bullets CSS - Custom styles for individual bullets",
        render: CodeField,
        metadata: {
          editorSettings: {
            height: "200px",
            defaultLanguage: "css",
            theme: "vs-dark",
            savingText: "Saving...",
            saveText: "Save",
            prefix: `.swiper-pagination-bullet {`,
            suffix: `}`,
          },
        },
      },
      bulletActiveCss: {
        type: "custom",
        label: "Bullet Active CSS - Custom styles for active bullet",
        render: CodeField,
        metadata: {
          editorSettings: {
            height: "200px",
            defaultLanguage: "css",
            theme: "vs-dark",
            savingText: "Saving...",
            saveText: "Save",
            prefix: `.swiper-pagination-bullet-active {`,
            suffix: `}`,
          },
        },
      },
    },
  },

  breakpoints: {
    type: "array",
    defaultItemProps: {
      slidesPerView: 1,
      breakPoint: 0,
      spaceBetween: 30,
    },
    label: "Breakpoints - Responsive settings for different screen sizes",
    getItemSummary: (item) => `Breakpoint: ${item.breakPoint}px`,
    arrayFields: {
      slidesPerView: {
        label: "Slides Per View - Number of slides at this breakpoint",
        type: "number",
      },
      breakPoint: {
        label: "Breakpoint (px) - Minimum screen width for these settings",
        type: "radio",
        options: [
          { label: "xs - 0 - 640px", value: 0 },
          { label: "sm - 640px - 768px", value: 640 },
          { label: "md - 768px - 1024px", value: 768 },
          { label: "lg - 1024px - 1280px", value: 1024 },
          { label: "xl - 1280px - 1536px", value: 1280 },
        ],
      },
      spaceBetween: {
        label: "Space Between Slides - Gap between slides at this breakpoint",
        type: "number",
      },
    },
  },
  className: {
    type: "text",
    label: "Class Name - Additional CSS classes for custom styling",
  },
};

export const SwiperSliderInternal: ComponentConfig<SwiperSliderProps> = {
  label: "Swiper Slider",
  fields: swiperFields,
  defaultProps: {
    current: 0,
    slidesPerPage: 1,
    slidesObj: [],
    spaceBetween: 50,
    loop: false,
    autoHeight: false,
    speed: 1000,
    autoplay: {
      enabled: false,
      delay: 1000,
      disableOnInteraction: false,
    },
    navigation: {
      enabled: false,
      placement: "outside",
    },
    pagination: {
      enabled: false,
      type: "normal",
    },
    breakpoints: [],
    layout: {
      spanCol: 2,
      grow: true,
    },
    bulletsContainerCss: `.swiper-pagination-custom {display: flex; justify-content: center; margin-top: 20px;}`,
    className: "", // Default className for custom styling
    hideOnMobile: false,
    hideOnDesktop: false,
    hideOnTablet: false,
  },
  resolveData: (data, params) => {
    const { changed, lastData = null, metadata } = params;
    if (!lastData) {
      // it's first render, we don't need to do anything
      return data;
    }
    const {
      categoryIdForAutoFill: categoryIdForAutoFillChanged = false,
      deleteAllButFirstSlide: deleteAllButFirstSlideChanged = false,
    } = changed;

    // console.log("SwiperSlider resolveData called with changes:", changed);
    if (!categoryIdForAutoFillChanged && !deleteAllButFirstSlideChanged) {
      return data;
    }

    // Delete all but first slide
    if (deleteAllButFirstSlideChanged) {
      const { deleteAllButFirstSlide, ...others } = data.props;
      return {
        ...data,
        props: {
          ...others,
          slidesObj: data.props.slidesObj.slice(0, 1),
        },
      };
    }

    // if categoryIdForAutoFill has changed, then we need to autofill the slides
    if (categoryIdForAutoFillChanged) {
      const { products = [] } = metadata;
      const { categoryIdForAutoFill, maxSlidesToAutoFill = 5 } = data.props;
      const allProductsInCategory = products.filter(
        (product: any, index: number) =>
          product.category_ids.includes(`${categoryIdForAutoFill}`)
      );

      console.log(
        `Found ${allProductsInCategory.length} products in category ${categoryIdForAutoFill}`
      );

      const productsInCategory =
        maxSlidesToAutoFill > 0
          ? allProductsInCategory.slice(0, maxSlidesToAutoFill)
          : allProductsInCategory;

      if (!productsInCategory.length) {
        // console.log.log("No products in category, returning data as is");
        const { categoryIdForAutoFill, ...others } = data.props;
        return {
          ...data,
          props: {
            ...others,
          },
        };
      }

      const firstSlide = data.props.slidesObj[0];
      if (!firstSlide) {
        // console.log.log("No first slide, returning data as is");
        const { categoryIdForAutoFill, ...others } = data.props;
        return {
          ...data,
          props: {
            ...others,
          },
        };
      }

      const newSlides = [] as any[];
      for (const product of productsInCategory) {
        const { id: productId } = product;
        const { items = [] } = firstSlide;
        const newItems = substituteProductIdInChips(items, productId);
        newSlides.push({ items: newItems });
      }

      return {
        ...data,
        props: {
          ...data.props,
          slidesObj: newSlides,
        },
      };
    }

    return data;
  },
  resolveFields: (data, params) => {
    const { fields } = params;

    if (
      !data.props.slidesObj.length ||
      !data.props.slidesObj[0] ||
      !Array.isArray(data.props.slidesObj[0].items) ||
      !data.props.slidesObj[0].items.length
    ) {
      // Remove fields to autocompile when there aren't any slides
      const {
        categoryIdForAutoFill,
        maxSlidesToAutoFill,
        deleteAllButFirstSlide,
        externalSourceForAutoFill,
        ...otherFields
      } = fields;
      return otherFields;
    }

    // If there is almost a slide with some items inside then we can show the auto compile fields

    // take the first field from the object "fields" and extract metadata
    const field = Object.values(fields)[0];

    const { metadata } = field;
    const { categories = [], products = [] } = metadata;

    // For each category, add the number of products in that category
    const categoriesWithCount = categories
      .map((category: any) => {
        const productsInCategory = products.filter((product: any) =>
          product.category_ids.includes(`${category.id}`)
        );
        return {
          ...category,
          productCount: productsInCategory.length,
        };
      })
      .filter((category: any) => category.productCount > 0); // filter out categories with 0 products

    // se c'é una slide, aggiungi un field con un bottone per autocompilare le slide basandosi sui prodotti di una categoria
    if (
      data.props.slidesObj.length > 0 &&
      data.props.slidesObj[0] &&
      Array.isArray(data.props.slidesObj[0].items) &&
      data.props.slidesObj[0].items.length > 0
    ) {
      // se c'é una slide, aggiungi un field con un bottone per autocompilare le slide basandosi sui prodotti di una categoria
      return {
        ...swiperFields,
        categoryIdForAutoFill: {
          type: "custom",
          label: "Auto Fill Slides with category products",
          render: (props) => {
            const { onChange } = props;

            const [selectedCategory, setSelectedCategory] = useState("");
            const [isDialogOpen, setIsDialogOpen] = useState(false);

            return (
              <FieldLabel label="Auto-Fill Slides from Category">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(true);
                  }}
                >
                  Auto-Fill Slides from Category
                </Button>

                {isDialogOpen && (
                  <Dialog
                    open={true}
                    onOpenChange={(val) => {
                      setIsDialogOpen(val);
                    }}
                  >
                    <DialogContent className="max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Select Category</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="space-y-4">
                          <Label>
                            Compile carousel with products from category
                          </Label>

                          <div className="">
                            <Label className="text-base font-medium">
                              Category
                            </Label>

                            <Select
                              value={selectedCategory}
                              onValueChange={(value) =>
                                setSelectedCategory(value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>

                              <SelectContent>
                                {categoriesWithCount.map((category: any) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name} - ID: {category.id} -
                                    Products: {category.productCount}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDialogOpen(false);
                            // console.log(
                            //   "Selected Category: ",
                            //   selectedCategory,
                            // );
                            onChange(selectedCategory);
                            setSelectedCategory("");
                          }}
                        >
                          Compile
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </FieldLabel>
            );
          },
        },
        // Add also a number field to limit the number of slides to create
        maxSlidesToAutoFill: {
          type: "number",
          label: "Max number of slides to auto-fill (0 = all products)",
          defaultValue: 5,
          min: 0,
          step: 1,
        },
        deleteAllButFirstSlide: {
          type: "custom",
          label: "Delete all but first slide",
          render: (props) => {
            const { onChange } = props;

            return (
              <Button
                variant="destructive"
                onClick={() => {
                  onChange(true);
                }}
              >
                Delete all but first slide
              </Button>
            );
          },
        },
        externalSourceForAutoFill: {
          type: "custom",
          label: "Auto Fill Slides with external source",
          render: (props) => {
            const { onChange } = props;

            const [selectedSource, setSelectedSource] = useState("");
            const [isDialogOpen, setIsDialogOpen] = useState(false);

            return (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(true);
                  }}
                >
                  Auto-Fill Slides from External Source
                </Button>

                {isDialogOpen && (
                  <Dialog
                    open={true}
                    onOpenChange={(val) => {
                      setIsDialogOpen(val);
                    }}
                  >
                    <DialogContent className="max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Select Source</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="space-y-4">
                          <Label>Compile carousel with External Source</Label>

                          <div className="">
                            <Label className="text-base font-medium">
                              Source
                            </Label>

                            <Select
                              value={selectedSource}
                              onValueChange={(value) =>
                                setSelectedSource(value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Source" />
                              </SelectTrigger>

                              <SelectContent>
                                <SelectItem
                                  key={"recentlyViewed"}
                                  value={"recentlyViewed"}
                                >
                                  Recently viewed
                                </SelectItem>
                                <SelectItem
                                  key={"aiRelatedProducts"}
                                  value={"aiRelatedProducts"}
                                >
                                  AI related products
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDialogOpen(false);
                            // console.log.log("Selected Source: ", selectedSource);
                            onChange(selectedSource);
                            setSelectedSource("");
                          }}
                        >
                          Compile
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            );
          },
        },
      };
    }

    return {
      ...fields,
      categoryIdForAutoFill: categoryIdForAutoFill(categoriesWithCount),
      // Add also a number field to limit the number of slides to create
      maxSlidesToAutoFill,
      deleteAllButFirstSlide,
      externalSourceForAutoFill,
    };
  },
  //inline: true,
  render: SwiperSliderRender,
};

const swiperWithLayout = withLayout(SwiperSliderInternal);

export const SwiperSlider = withExport(withAdminLayout(swiperWithLayout));
