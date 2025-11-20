import { type Config, type Data } from "@measured/puck";
import Root, { type RootProps } from "./root";
import { Button } from "./blocks/Button";
import { Grid } from "./blocks/Grid";
import { Flex } from "./blocks/Flex";
import { Text } from "./blocks/Text";
import { Space } from "./blocks/Space";
import { Image } from "./blocks/Image";
import { Video } from "./blocks/Video";

import { SwiperSlider } from "./blocks/Swiper";
import { FlexVideo, type FlexVideoProps } from "./blocks/FlexVideo";

import { Accordion, AccordionProps } from "./blocks/Accordion";
import { Tabs } from "./blocks/Tabs";
import { ImageProps } from "next/image";
import { ButtonProps } from "./blocks/Button/button";
import { FlexProps } from "./blocks/Flex/flex";
import { GridProps } from "./blocks/Grid/grid";
import { SpaceProps } from "./blocks/Space/space";
import { SwiperSliderProps } from "./blocks/Swiper/swiper";
import { TextProps } from "./blocks/Text/text";
import { VideoProps } from "./blocks/Video/video";

export type PuckComponentsProps = {
  Button: ButtonProps;
  Grid: GridProps;
  Flex: FlexProps;
  FlexVideo: FlexVideoProps;
  Text: TextProps;
  Space: SpaceProps;
  Image: ImageProps;

  Video: VideoProps;

  SwiperSlider: SwiperSliderProps;
  Accordion: AccordionProps;
};

export type UserConfig = Config<
  PuckComponentsProps,
  any,
  "layout" | "typography" | "interactive" | "media" | "templates"
>;

export type UserData = Data<PuckComponentsProps, RootProps>;

// We avoid the name config as next gets confused
export const puckBaseConfig = (rootFields = {}, otherComponents = {}) => {
  return {
    root: {
      fields: rootFields,
      render: Root,
    },

    categories: {
      layout: {
        components: ["Grid", "Flex", "FlexVideo", "Space", "Accordion", "Tabs"],
        defaultExpanded: true,
      },
      typography: {
        components: ["Text"],
        defaultExpanded: false,
      },
      media: {
        components: ["Image", "Video", "SwiperSlider"],
        defaultExpanded: false,
      },
      interactive: {
        title: "Actions",
        components: ["Button"],
        defaultExpanded: false,
      },
      templates: {
        components: Object.keys(otherComponents),
        defaultExpanded: false,
      },
    },
    components: {
      Button,
      Grid,
      Flex,
      FlexVideo,
      Text,
      Space,
      Image,

      Video,

      Accordion,
      Tabs,
      SwiperSlider,
      ...otherComponents,
    },
  };
};
