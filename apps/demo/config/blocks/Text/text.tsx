import type { PuckComponent } from "@measured/puck";
import { merge } from "lodash";
import { Section } from "../../components/Section";
import styles from "./text.module.css";

type BaseTextProps = {
  align: "left" | "center" | "right";
  text?: string;
  padding?: string;
  size?: string;
  lineHeight?: string;
  fontWeight?: string;
  fontStyle?: string;
  fontFamily?: string;
  textShadow?: string;
  textDecorationLine?: string;
  textDecorationStyle?: "solid" | "double" | "dotted" | "dashed" | "wavy";
  textDecorationThickness?: string;
  textUnderlineOffset?: string;
  color: string;
  maxWidth?: string;
};

export type TextProps = BaseTextProps & {
  mobile: BaseTextProps;
  className?: string;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
  type: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};

export const TextRender: PuckComponent<TextProps> = (props) => {
  //console.log('Text render props', props);

  const {
    mobile,
    hideOnMobile = false,
    hideOnDesktop = false,
    hideOnTablet = false,
    type: TextTag = "p",
    className = "",
    ...desktopProps
  } = props;

  const {
    align,
    color,
    text,
    size,
    fontWeight,
    fontStyle,
    lineHeight,
    textShadow = "none",
    textDecorationLine,
    textDecorationStyle,
    textDecorationThickness,
    textUnderlineOffset,
    maxWidth,
    fontFamily,
  } = desktopProps;

  const mobileProps = merge({}, desktopProps, mobile);

  const cssVariables = {
    "--display-desktop": hideOnDesktop ? "none" : "initial",
    "--display-mobile": hideOnMobile ? "none" : "initial",
    "--display-tablet": hideOnTablet ? "none" : "initial",
    "--align": align,
    "--mobile-align": mobileProps.align,
    "--color": color,
    "--mobile-color": mobileProps.color,
    "--size": size,
    "--mobile-size": mobileProps.size,
    "--font-weight": fontWeight,
    "--mobile-font-weight": mobileProps.fontWeight,
    "--font-style": fontStyle,
    "--mobile-font-style": mobileProps.fontStyle,
    "--line-height": lineHeight,
    "--mobile-line-height": mobileProps.lineHeight,
    "--text-shadow": textShadow,
    "--mobile-text-shadow": mobileProps.textShadow,
    "--text-decoration-line": textDecorationLine,
    "--mobile-text-decoration-line": mobileProps.textDecorationLine,
    "--text-decoration-style": textDecorationStyle,
    "--mobile-text-decoration-style": mobileProps.textDecorationStyle,
    "--text-decoration-thickness": textDecorationThickness,
    "--mobile-text-decoration-thickness": mobileProps.textDecorationThickness,
    "--text-underline-offset": textUnderlineOffset,
    "--mobile-text-underline-offset": mobileProps.textUnderlineOffset,
    "--font-family": fontFamily,
    "--mobile-font-family": mobileProps.fontFamily,
    "--max-width": maxWidth,
    "--mobile-max-width": mobileProps.maxWidth,
  } as React.CSSProperties;

  //console.log('Text cssVariables', cssVariables);

  return (
    <Section className={`${styles.puckTextContainer}`} style={cssVariables}>
      <TextTag
        style={cssVariables}
        className={`${className} ${styles.puckText}`}
      >
        {text}
      </TextTag>
    </Section>
  );
};
