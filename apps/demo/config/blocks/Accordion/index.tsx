import { Field, Slot, type ComponentConfig } from "@/core/types";
import { useDeepCompareEffect } from "use-deep-compare";

import { withExport } from "../../decorators/withExport";
import { withAdminLayout } from "../../decorators/withAdminLayout";
import { withLayout } from "../../decorators/withLayout";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./accordion.module.css";

const baseFields: Record<string, Field> = {
  allowMultiple: {
    type: "select",
    label: "Allow Multiple Open",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },

  className: {
    type: "text",
    label: "Class Name",
  },
};

const defaultProps: AccordionProps = {
  items: [],
  allowMultiple: false,
  className: "",
};

const fields = {
  items: {
    type: "array",
    label: "Slides",
    defaultItemProps: {
      header: [],
      content: [],
      isOpen: false,
    },
    arrayFields: {
      header: {
        type: "slot",
        label: "Header Items",
      },
      content: {
        type: "slot",
        label: "Content Items",
      },
      isOpen: {
        type: "select",
        label: "Initially Open",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },

  ...baseFields,

  mobile: {
    type: "object",
    label: "Mobile Settings",
    objectFields: baseFields,
  },
};

type AccordionItemProps = {
  header: Slot;
  content: Slot;
  isOpen?: boolean;
};

export type AccordionProps = {
  items: AccordionItemProps[];
  allowMultiple?: boolean;
  className?: string;
};

const render: any = (props) => {
  const { items = [], allowMultiple = false, className = "" } = props;
  // Initialize open states based on isOpen prop
  const [openItems, setOpenItems] = useState<Set<number>>(new Set<number>());

  useDeepCompareEffect(() => {
    console.log("AccordionRender props changed:", items);
    // Update open items if props change
    const updatedOpen = new Set<number>();
    items.forEach((item, index) => {
      if (item.isOpen) {
        updatedOpen.add(index);
      }
    });
    setOpenItems(updatedOpen);
  }, [items]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);

      if (next.has(index)) {
        // Close this item
        next.delete(index);
      } else {
        // Open this item
        if (!allowMultiple) {
          // If not allowing multiple, close all others
          next.clear();
        }
        next.add(index);
      }

      return next;
    });
  };

  return (
    <div className={`${styles.Accordion} ${className}`.trim()}>
      {items.map((item, index) => {
        const isOpen = openItems.has(index);
        const HeaderSlot = item.header;
        const ContentSlot = item.content;

        return (
          <div key={index} className={styles.AccordionItem}>
            <button
              type="button"
              className={styles.AccordionHeader}
              onClick={() => toggleItem(index)}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${index}`}
            >
              <div className={styles.AccordionHeaderContent}>
                <HeaderSlot />
              </div>
              <div
                className={`${styles.AccordionIcon} ${
                  isOpen ? styles.AccordionIconOpen : ""
                }`}
              >
                <ChevronDown size={20} />
              </div>
            </button>
            <div
              id={`accordion-content-${index}`}
              className={`${styles.AccordionContent} ${
                isOpen
                  ? styles.AccordionContentOpen
                  : styles.AccordionContentClosed
              }`}
              aria-hidden={!isOpen}
            >
              <div className={styles.AccordionContentInner}>
                <ContentSlot />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AccordionInternal: ComponentConfig<AccordionProps> = {
  fields,
  defaultProps: {
    ...defaultProps,
    mobile: {},
  },
  resolveFields: (data, { fields }) => {
    return fields;
  },
  resolveData: (data) => {
    return data;
  },
  render,
};

const accordionWithLayout = withLayout(AccordionInternal);

export const Accordion = withExport(withAdminLayout(accordionWithLayout));
