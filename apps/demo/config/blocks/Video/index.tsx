import { createUsePuck, type ComponentConfig } from "@puckeditor/core";

import { ColorField } from "../../fields/ColorField";

import { srcField } from "../../fields/srcField";

import { v4 as uuidv4 } from "uuid";
import { withExport } from "../../decorators/withExport";
import { withEvents } from "../../decorators/withEvents";
import { merge } from "lodash";
import { withAdminLayout } from "../../decorators/withAdminLayout";
import { VideoProps, VideoRender } from "./video";
import { withLayout } from "../../decorators/withLayout";

const fields = {
  videoId: {
    type: "text",
    label: "Video ID",
  },
  src: {
    ...srcField(["video/mp4"]),
    label: "Video Source",
  },
  posterSrc: {
    ...srcField(["image/*"]),
    label: "Poster Source",
  },
  autoPlay: {
    type: "select",
    label: "Auto Play",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  controls: {
    type: "select",
    label: "Controls",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  loop: {
    type: "select",
    label: "Loop",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  muted: {
    type: "select",
    label: "Muted",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },

  width: {
    type: "text",
    label: "Width",
  },
  height: {
    type: "text",
    label: "Height",
  },
  alignment: {
    type: "select",
    label: "Alignment",
    options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ],
  },
  caption: {
    type: "text",
    label: "Caption",
  },
  showCaption: {
    type: "select",
    label: "Show Caption",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  borderStyle: {
    type: "select",
    options: [
      { label: "None", value: "none" },
      { label: "Solid", value: "solid" },
      { label: "Double", value: "double" },
      { label: "Dotted", value: "dotted" },
      { label: "Dashed", value: "dashed" },
      { label: "Wavy", value: "wavy" },
    ],
  },
  borderWidth: {
    type: "text",
    label: "Border Width",
    placeholder: "e.g. 1px, 2px, 3px",
  },
  borderColor: {
    type: "custom",
    label: "Border Color",
    render: ColorField,
  },
  borderRadius: {
    type: "text",
    label: "Border Radius",
    placeholder: "e.g. 0px, 5px, 10px",
  },

  objectFit: {
    type: "select",
    label: "Object Fit",
    options: [
      { label: "Cover", value: "cover" },
      { label: "Contain", value: "contain" },
      { label: "Fill", value: "fill" },
      { label: "None", value: "none" },
      { label: "Scale Down", value: "scale-down" },
    ],
  },
  className: {
    type: "text",
    label: "Class Name",
  },
  mobile: {
    type: "object",
    label: "Mobile Props",
    objectFields: {
      src: {
        ...srcField(["video/mp4"]),
        label: "Mobile Video Source",
      },
    },
  },
};
const usePuck = createUsePuck();

const VideoInternal: ComponentConfig<VideoProps> = {
  fields,
  defaultProps: {
    videoId: `video-${uuidv4()}`,
    src: { content: "/9fd66535_4a5956d7.mp4" },
    posterSrc: { content: "" },
    autoPlay: true,
    controls: true,
    loop: true,
    muted: true,

    width: "100%",
    height: "auto",
    alignment: "center",
    caption: "",
    showCaption: false,
    hasBorder: false,
    borderWidth: "0px",
    borderColor: "#000000",
    borderRadius: "0px",
    objectFit: "cover",
    className: "",
  },

  resolveFields: (data, { fields }) => {
    return fields;
  },
  resolveData: (data) => {
    return data;
  },

  render: (props) => {
    const { mobile, puck, ...desktop } = props;

    const { metadata } = puck;
    const { environment } = metadata ?? {};
    const { frontendUrl } = environment ?? {};

    const isMobile = usePuck(
      (s) => s.appState.ui.viewports.current.width < 640
    );

    const adminProps = isMobile ? merge({ puck }, desktop, mobile) : desktop;

    const currentVideoSrc = `${frontendUrl}/assets${adminProps.src.content}`;
    const currentPosterSrc = `${frontendUrl}/assets${adminProps.posterSrc?.content}`;

    return (
      <VideoRender
        {...adminProps}
        src={currentVideoSrc}
        posterSrc={currentPosterSrc}
        mobile={adminProps}
      />
    );
  },
};

const videoWithLayout = withLayout(VideoInternal);

export const Video = withExport(withEvents(withAdminLayout(videoWithLayout)));
