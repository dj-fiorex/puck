"use client";

import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../store";
import { SlotRenderPure } from "./server";
import { DropZoneProps } from "../DropZone/types";
export * from "./server";

export const ContextSlotRender = ({
  componentId,
  zone,
  as,
  className,
  style,
  allow,
  disallow,
  minEmptyHeight,
  collisionAxis,
}: {
  componentId: string;
} & DropZoneProps) => {
  const config = useAppStore((s) => s.config);
  const metadata = useAppStore((s) => s.metadata);
  const slotContent = useAppStore(
    useShallow((s) => {
      const indexes = s.state.indexes;

      const contentIds =
        indexes.zones[`${componentId}:${zone}`]?.contentIds ?? [];

      return contentIds.map((contentId) => indexes.nodes[contentId].flatData);
    })
  );

  return (
    <SlotRenderPure
      content={slotContent}
      zone={zone}
      config={config}
      metadata={metadata}
      as={as}
      className={className}
      style={style}
      allow={allow}
      disallow={disallow}
      minEmptyHeight={minEmptyHeight}
      collisionAxis={collisionAxis}
    />
  );
};
