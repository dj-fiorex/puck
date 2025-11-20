/* eslint-disable react-hooks/rules-of-hooks */
import type { PuckComponent, Slot } from "@measured/puck";
import { useEffect, useState } from "react";
import styles from "./tabs.module.css";

export type TabsItemProps = {
  header: Slot;
  content: Slot;
};

export type TabsProps = {
  items: TabsItemProps[];
  currentIndex?: number;
  className?: string;
};

export const TabsRender: PuckComponent<TabsProps> = (props) => {
  const { items = [], currentIndex = 0, className = "" } = props;
  const [activeTab, setActiveTab] = useState(currentIndex);

  // Sync activeTab with currentIndex prop changes
  useEffect(() => {
    setActiveTab(currentIndex);
  }, [currentIndex]);

  // Validate activeTab index to prevent out-of-bounds access
  const safeActiveTab =
    activeTab >= 0 && activeTab < items.length ? activeTab : 0;
  const CurrentSlot = items[safeActiveTab]?.content;

  // Early return if no items
  if (!items.length) {
    return <></>;
  }

  return (
    <div className={`${styles.simpleTabs} ${className}`.trim()}>
      <div className={styles.tabsHeader} role="tablist">
        {items.map((tab, index) => {
          const HeaderSlot = tab.header;
          const isActive = safeActiveTab === index;

          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${index}`}
              id={`tab-${index}`}
              className={`${styles.tabButton} ${
                isActive ? styles.active : ""
              }`.trim()}
              onClick={() => setActiveTab(index)}
            >
              {HeaderSlot ? <HeaderSlot /> : null}
            </button>
          );
        })}
      </div>
      <div
        className={styles.tabsContent}
        role="tabpanel"
        aria-labelledby={`tab-${safeActiveTab}`}
        id={`tabpanel-${safeActiveTab}`}
      >
        {CurrentSlot ? <CurrentSlot /> : null}
      </div>
    </div>
  );
};
