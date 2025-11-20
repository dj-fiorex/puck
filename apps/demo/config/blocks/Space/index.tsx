import {
  AutoField,
  createUsePuck,
  FieldLabel,
  type ComponentConfig,
} from "@measured/puck";
import { spacingOptions } from "../../options";

import { useMemo } from "react";
import { SpaceProps, SpaceRender } from "./space";

const usePuck = createUsePuck();

export const Space: ComponentConfig<SpaceProps> = {
  label: "Space",
  fields: {
    size: {
      type: "custom",
      render: (props) => {
        const {
          onChange,
          value,
          field: { label = "Size" },
        } = props;
        const options = useMemo(() => {
          return !value
            ? spacingOptions
            : [
                ...spacingOptions,
                ...(spacingOptions.some((option) => option.value === value)
                  ? []
                  : [
                      {
                        value: value,
                        label: value,
                      },
                    ]),
              ];
        }, [value]);
        return (
          <FieldLabel label={label}>
            <AutoField
              field={{ type: "select", options: options }}
              onChange={onChange}
              value={value}
            />
            <AutoField
              field={{ type: "text" }}
              onChange={onChange}
              value={value}
            />
          </FieldLabel>
        );
      },
    },
    mobileSize: {
      type: "custom",
      render: (props) => {
        const {
          onChange,
          value,
          field: { label = "Mobile Size" },
        } = props;
        const options = useMemo(() => {
          return !value
            ? spacingOptions
            : [
                ...spacingOptions,
                ...(spacingOptions.some((option) => option.value === value)
                  ? []
                  : [
                      {
                        value: value,
                        label: value,
                      },
                    ]),
              ];
        }, [value]);
        return (
          <FieldLabel label={label}>
            <AutoField
              field={{ type: "select", options: options }}
              onChange={onChange}
              value={value}
            />
            <AutoField
              field={{ type: "text" }}
              onChange={onChange}
              value={value}
            />
          </FieldLabel>
        );
      },
    },
    direction: {
      type: "radio",
      options: [
        { value: "vertical", label: "Vertical" },
        { value: "horizontal", label: "Horizontal" },
        { value: "", label: "Both" },
      ],
    },
  },
  defaultProps: {
    direction: "",
    size: "24px",
    mobileSize: "16px",
  },
  inline: true,
  resolveFields: (data, { fields }) => {
    return fields;
  },
  resolveData: (data) => {
    return data;
  },
  render: (props) => {
    const { size = "24px", mobileSize = "16px", puck, ...otherProps } = props;

    const isMobile = usePuck(
      (s) => s.appState.ui.viewports.current.width < 640,
    );

    return (
      <SpaceRender
        {...otherProps}
        size={isMobile ? mobileSize : size}
        mobileSize={isMobile ? mobileSize : size}
        puck={puck}
      />
    );
  },
};
