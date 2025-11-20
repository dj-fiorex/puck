import Handlebars from "handlebars";

// Media gallery entry interface
export interface MediaGalleryEntry {
  id: number;
  media_type: string;
  label: string | null;
  position: number;
  disabled: boolean;
  types: string[];
  file: string;
}

export interface TemplateChip {
  id: string;
  template: string;
  value: string;
  startIndex: number;
  endIndex: number;
  productId?: number;
}

export interface SavedTemplate {
  content: string;
  chips: TemplateChip[];
}

export const availableTemplates = [
  {
    key: "{{product.name}}",
    label: "Product Name",
    category: "Product",
    requiresProduct: true,
  },
  {
    key: "{{product.url_key}}",
    label: "Product URL",
    category: "Product",
    requiresProduct: true,
  },
  {
    key: "product_image",
    label: "Product Image",
    category: "Product",
    requiresProduct: true,
    requiresImageSelection: true,
  },
  {
    key: "{{product.childProducts.[0].price}}",
    label: "Product Price",
    category: "Product",
    requiresProduct: true,
  },
  {
    key: "{{product.description}}",
    label: "Product Description",
    category: "Product",
    requiresProduct: true,
  },
  {
    key: "{{product.sku}}",
    label: "Product SKU",
    category: "Product",
    requiresProduct: true,
  },
  {
    key: "{{stockStatus product.denormalization.isInStock}}",
    label: "Stock Status",
    category: "Product",
    requiresProduct: true,
  },
  // Advanced templates with helpers
  {
    key: "{{formatCurrency product.childProducts.[0].price store.base_currency_code store.locale}}",
    label: "Formatted Product Price",
    category: "Helpers",
    requiresProduct: true,
  },
  {
    key: "{{store.base_currency_code}}",
    label: "Base Currency Code",
    category: "Store",
    requiresProduct: false,
  },
  {
    key: "{{store.locale}}",
    label: "Store Locale",
    category: "Store",
    requiresProduct: false,
  },
  // {
  //   key: "{{formatDate order.date}}",
  //   label: "Formatted Order Date",
  //   category: "Helpers",
  //   requiresProduct: false,
  // },
  // {
  //   key: "{{uppercase user.name}}",
  //   label: "User Name (Uppercase)",
  //   category: "Helpers",
  //   requiresProduct: false,
  // },
  // {
  //   key: "{{lowercase user.email}}",
  //   label: "User Email (Lowercase)",
  //   category: "Helpers",
  //   requiresProduct: false,
  // },
];

/**
 * we will receive here in the "text" prop the template string and "chips" that is like that:
 * {
 *     "content": "170 sono io Recalling the crystal-clear waters of the Mediterranean sea, this exclusive dessert plate is adorned with the Alegria motif in myriad shades of blue, truly captuing the spirit of summer. A captivating choice for the most delicious sweet treats, the Alegria tableware collection is drawn by Edgardo Osorio and hand-crafted on a lathe by Apulian artisans, making each piece unique.",
 *     "chips": [
 *         {
 *             "id": "s0g438ecr",
 *             "template": "{{product.childProducts.[0].price}}",
 *             "value": "170",
 *             "startIndex": 0,
 *             "endIndex": 3,
 *             "productId": 89065
 *         },
 *         {
 *             "id": "bgrgiy1tv",
 *             "template": "{{product.description}}",
 *             "value": "Recalling the crystal-clear waters of the Mediterranean sea, this exclusive dessert plate is adorned with the Alegria motif in myriad shades of blue, truly captuing the spirit of summer. A captivating choice for the most delicious sweet treats, the Alegria tableware collection is drawn by Edgardo Osorio and hand-crafted on a lathe by Apulian artisans, making each piece unique.",
 *             "startIndex": 12,
 *             "endIndex": 391,
 *             "productId": 89065
 *         }
 *     ]
 *  }
 */
export const transformText: (
  content: string,
  chips: TemplateChip[],
  products: any[],
  store: { base_currency_code: string; locale: string }
) => string = (
  content = "",
  chips = [],
  products = [],
  store = { base_currency_code: "EUR", locale: "it-IT" }
) => {
  if (!chips.length) {
    return content; // No chips to process, return original content
  }
  let transformedContent = content;
  chips.forEach((chip) => {
    const product = products.find((p) => p.id === chip.productId);
    if (product) {
      // Replace the value in the chip with the actual product value based on the handlebars template and startIndex/endIndex
      const value = resolveTemplate(chip.template, product, store);
      transformedContent =
        transformedContent.slice(0, chip.startIndex) +
        value +
        transformedContent.slice(chip.endIndex);
    } else {
      console.warn(
        `Product with ID ${chip.productId} not found for chip ${chip.id}`
      );
      transformedContent =
        transformedContent.slice(0, chip.startIndex) +
        chip.value +
        transformedContent.slice(chip.endIndex);
    }
  });
  return transformedContent;
};

/**
 * Creates template data with selected product
 */
export function createTemplateData(
  selectedProduct: any,
  store: { base_currency_code: string; locale: string } = {
    base_currency_code: "EUR",
    locale: "it-IT",
  }
) {
  return {
    product: selectedProduct,
    store,
  };
}

/**
 * Resolves a single template string using Handlebars
 * @param template - The template string to resolve (e.g., "{{user.name}}")
 * @param selectedProduct - Optional product to use in template data
 * @returns The resolved template value or the original template if compilation fails
 */
export function resolveTemplate(
  template: string,
  selectedProduct: any,
  store: { base_currency_code: string; locale: string }
): string {
  try {
    const data = createTemplateData(selectedProduct, store);
    const compiledTemplate = Handlebars.compile(template);
    const result = compiledTemplate(data);
    return result || template;
  } catch (error) {
    console.warn("Template compilation error:", error);
    return template;
  }
}

/**
 * Renders full content with handlebars templates
 * @param content - The content string containing handlebars templates
 * @param selectedProduct - Optional product to use in template data
 * @returns The fully rendered content with all templates resolved
 */
export function renderFullContent(
  content: string,
  selectedProduct: any
): string {
  try {
    const data = createTemplateData(selectedProduct);
    const compiledTemplate = Handlebars.compile(content);
    return compiledTemplate(data);
  } catch (error) {
    console.warn("Content rendering error:", error);
    return content;
  }
}

/**
 * Validates if a template string has valid Handlebars syntax
 * @param template - The template string to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateTemplate(template: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    Handlebars.compile(template);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown template error",
    };
  }
}

/**
 * Searches products by name, description, category, brand, or tags
 */
export function searchProducts(products: any[], query: string): any[] {
  if (!query.trim()) return products;

  const searchTerm = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get unique image types from a product's media gallery
 */
export function getUniqueImageTypes(product: any): string[] {
  const allTypes = product.media_gallery_entries.flatMap(
    (entry) => entry.types
  );
  return Array.from(new Set(allTypes)).sort();
}

/**
 * Filter media gallery entries by types
 */
export function filterImagesByTypes(
  product: any,
  types: string[]
): MediaGalleryEntry[] {
  return product.media_gallery_entries.filter((entry) =>
    types.some((type) => entry.types.includes(type))
  );
}

/**
 * Registers custom Handlebars helpers
 */
export function registerHelpers() {
  // Format currency helper
  Handlebars.registerHelper(
    "formatCurrency",
    (value: string | number, currency: string = "EUR", locale = "it-IT") => {
      const num =
        typeof value === "string"
          ? Number.parseFloat(value.toString().replace(/[^0-9.-]+/g, ""))
          : value;
      if (num % 1 == 0)
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(num);
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(num);
    }
  );

  // Format date helper
  Handlebars.registerHelper("formatDate", (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Uppercase helper
  Handlebars.registerHelper("uppercase", (value: string) =>
    value ? value.toString().toUpperCase() : ""
  );

  // Lowercase helper
  Handlebars.registerHelper("lowercase", (value: string) =>
    value ? value.toString().toLowerCase() : ""
  );

  // Stock status helper
  Handlebars.registerHelper("stockStatus", (inStock: boolean) =>
    inStock ? "In Stock" : "Out of Stock"
  );

  // Rating stars helper
  Handlebars.registerHelper("ratingStars", (rating: number) => {
    const stars = Math.round(rating);
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  });

  // Product image helper - get image by index
  Handlebars.registerHelper(
    "productImageByIndex",
    (mediaGallery: MediaGalleryEntry[], index: number) => {
      if (
        !mediaGallery ||
        !Array.isArray(mediaGallery) ||
        index < 0 ||
        index >= mediaGallery.length
      ) {
        return "";
      }
      return mediaGallery[index].file;
    }
  );

  // Product image helper - get image by types
  Handlebars.registerHelper(
    "productImageByTypes",
    (mediaGallery: MediaGalleryEntry[], ...types: string[]) => {
      if (!mediaGallery || !Array.isArray(mediaGallery)) {
        return "";
      }

      // Remove the last argument which is the Handlebars options object
      const searchTypes = types.slice(0, -1);

      const matchingImage = mediaGallery.find((entry) =>
        searchTypes.some((type) => entry.types.includes(type))
      );

      return matchingImage ? matchingImage.file : "";
    }
  );
}

// Register helpers on module load
registerHelpers();
