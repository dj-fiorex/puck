import { type ComponentConfig } from "@puckeditor/core";

import { FlexVideoRender } from "./flex-video";

import { createUsePuck } from "@puckeditor/core";
import { srcField } from "../../fields/srcField";
import { useMemo } from "react";
import { merge } from "lodash";
import { withExport } from "../../decorators/withExport";
import { withEvents } from "../../decorators/withEvents";
import { withAdminLayout } from "../../decorators/withAdminLayout";
import { FlexProps } from "../Flex/flex";
import { withLayout } from "../../decorators/withLayout";

const usePuck = createUsePuck();

export type FlexVideoProps = Omit<
  FlexProps,
  | "backgroundColor"
  | "backgroundImageSrc"
  | "backgroundSize"
  | "backgroundPosition"
  | "backgroundRepeat"
> & {
  videoSrc?: string;
  videoMobileSrc?: string; // Optional prop for mobile video source
  videoShowControls?: boolean;
  videoAutoplay?: boolean;
  videoLoop?: boolean;
  videoMuted?: boolean;
  useOverlay?: boolean; // Optional prop to control overlay visibility
  className?: string; // Optional className prop
};

type AdminFlexVideoProps = Omit<
  FlexVideoProps,
  "videoSrc" | "videoMobileSrc"
> & {
  videoSrc: { content: string; chips: unknown[] };
  videoMobileSrc: { content: string; chips: unknown[] };
};

const baseFields = {
  videoAutoplay: {
    type: "select",
    label: "Auto Play - Automatically start playing the video when loaded",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  videoShowControls: {
    type: "select",
    label: "Controls - Show video playback controls",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  videoLoop: {
    type: "select",
    label: "Loop - Repeat video continuously",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  videoMuted: {
    type: "select",
    label: "Muted - Start video with sound muted",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  useOverlay: {
    type: "select",
    label: "Use Overlay - Add dark gradient overlay on video",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  aspectRatio: {
    type: "text",
    label: "Aspect Ratio - Video dimension ratio (e.g. 16/9, 4/3)",
  },
  direction: {
    label: "Direction - Flex layout direction for content",
    type: "radio",
    options: [
      { label: "Row", value: "row" },
      { label: "Column", value: "column" },
    ],
  },
  justifyContent: {
    label: "Justify Content - Horizontal alignment of content",
    type: "radio",
    options: [
      { label: "Start", value: "start" },
      { label: "Center", value: "center" },
      { label: "End", value: "end" },
      { label: "Space Between", value: "space-between" },
      { label: "Space Around", value: "space-around" },
      { label: "Space Evenly", value: "space-evenly" },
    ],
  },
  alignItems: {
    label: "Align Items - Vertical alignment of content",
    type: "radio",
    options: [
      { label: "Start", value: "start" },
      { label: "Center", value: "center" },
      { label: "End", value: "end" },
    ],
  },
  gap: {
    label: "Gap - Spacing between flex items (in pixels)",
    type: "number",
    min: 0,
  },
  wrap: {
    label: "Wrap - Allow items to wrap to next line",
    type: "radio",
    options: [
      { label: "true", value: "wrap" },
      { label: "false", value: "nowrap" },
    ],
  },
  height: {
    type: "text",
    label: "Height - Container height (e.g. 100%, 500px)",
  },
  width: {
    type: "text",
    label: "Width - Container width (e.g. 100%, 500px)",
  },
  margin: {
    type: "text",
    label: "Margin - Outer spacing around container",
  },
  className: {
    type: "text",
    label: "Class Name - Additional CSS classes",
  },
};

const fields = {
  videoSrc: {
    ...srcField(["video/mp4"]),
    label: "Video Source",
  },
  videoMobileSrc: {
    ...srcField(["video/mp4"]),
    label: "Mobile Video Source",
  },

  items: {
    type: "slot",
  },
  ...baseFields,

  hideOnDesktop: {
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  hideOnMobile: {
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  hideOnTablet: {
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },

  mobile: {
    type: "object",
    label: "Mobile Props",
    objectFields: {
      ...baseFields,
    },
  },
};

const defaultProps = {
  mobile: {},
  height: "100%",
  width: "100%",
  justifyContent: "start",
  direction: "row",
  alignItems: "start",
  gap: 24,
  wrap: "wrap",
  margin: "auto",
  useOverlay: false,
  layout: {
    grow: true,
  },
  backgroundColor: "transparent",
  backgroundImage: "",
  backgroundSize: "contain",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  items: [],

  videoShowControls: true,
  videoAutoplay: true,
  videoLoop: true,
  videoMuted: true,
  className: "",
  hideOnDesktop: false,
  hideOnMobile: false,
  hideOnTablet: false,
};

const FlexVideoInternal: ComponentConfig<AdminFlexVideoProps> = {
  fields,
  defaultProps,
  inline: true,
  resolveFields: (data, { fields }) => {
    return fields;
  },
  resolveData: (data) => {
    return data;
  },
  render: (props) => {
    const { puck, mobile, videoSrc, videoMobileSrc, ...desktop } = props;

    const { metadata } = puck;
    const { environment } = metadata ?? {};
    const { frontendUrl } = environment ?? {};

    const isMobile = usePuck(
      (s) => s.appState.ui.viewports.current.width < 640
    );

    // console.log(JSON.stringify(desktop));

    // console.log(JSON.stringify(mobile));

    const adminProps = isMobile ? merge({}, desktop, mobile) : desktop;

    const currentVideoSrc = useMemo(() => {
      if (isMobile && videoMobileSrc?.content) {
        if (`${videoMobileSrc?.content}`.startsWith("http")) {
          return videoMobileSrc.content;
        }
        return `${frontendUrl}/assets${videoMobileSrc.content}`;
      }
      if (!videoSrc?.content) {
        return;
      }
      // If not mobile or no mobile video source, use the desktop video source
      if (`${videoSrc?.content}`.startsWith("http")) {
        return videoSrc.content;
      }
      return `${frontendUrl}/assets${videoSrc.content}`;
    }, [frontendUrl, isMobile, videoMobileSrc, videoSrc]);

    return <FlexVideoRender {...adminProps} videoSrc={currentVideoSrc} />;
  },
};

const flexVideoWithLayout = withLayout(FlexVideoInternal);

export const FlexVideo = withExport(
  withEvents(withAdminLayout(flexVideoWithLayout))
);
