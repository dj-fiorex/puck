import type { ComponentConfig, DefaultComponentProps } from '@/core/types';
import { LayoutRender } from '../blocks/Layout';
import { layoutField, type LayoutFieldProps } from '../blocks/Layout/fields';

export type WithLayout<Props extends DefaultComponentProps> = Props & {
  layout?: LayoutFieldProps;
};

const defaultLayout: LayoutFieldProps = {
  spanCol: 1,
  spanRow: 1,
  paddingTop: '0px',
  paddingBottom: '0px',
  paddingLeft: '0px',
  paddingRight: '0px',
  width: 'auto',
  marginTop: '0px',
  marginBottom: '0px',
  marginLeft: '0px',
  marginRight: '0px',
  grow: false,
  alignSelf: 'auto',
  position: 'static',
  zIndex: 1,
  order: 0,
};

const defaultLayoutProps: LayoutFieldProps = {
  ...defaultLayout,
  mobile: {},
};
export function withLayout<Props extends DefaultComponentProps = DefaultComponentProps>(
  // @ts-expect-error bho
  componentConfig: ComponentConfig<Props>,
  // @ts-expect-error bho
): ComponentConfig<Props & { layout?: LayoutFieldProps }> {
  return {
    ...componentConfig,

    fields: {
      ...componentConfig.fields,
      layout: layoutField,
    },

    defaultProps: {
      ...componentConfig.defaultProps,
      layout: {
        ...defaultLayoutProps,
        ...componentConfig.defaultProps?.layout,
      },
    },

    resolveFields: async (data, params) => {
      const { changed } = params;

      let resolvedFields = componentConfig.fields;

      if (componentConfig.resolveFields) {
        // Check if resolveFields return Promise or not
        resolvedFields = await componentConfig.resolveFields(data, params);
      }

      if (!changed?.layout) {
        return resolvedFields;
      }

      if (params.parent?.type === 'Grid') {
        return {
          ...resolvedFields,
          layout: {
            ...layoutField,
            objectFields: {
              ...layoutField.objectFields,
              spanCol: layoutField.objectFields.spanCol,
              spanRow: layoutField.objectFields.spanRow,
              order: layoutField.objectFields.order,
            },
          },
        };
      }
      if (params.parent?.type === 'Flex' || params.parent?.type === 'FlexVideo') {
        return {
          ...resolvedFields,
          layout: {
            ...layoutField,
            objectFields: {
              ...layoutField.objectFields,
              grow: layoutField.objectFields.grow,
              alignSelf: layoutField.objectFields.alignSelf,
              mobile: {
                ...layoutField.objectFields.mobile,
                objectFields: {
                  // @ts-expect-error objectFields is not assignable to type ObjectField
                  ...layoutField.objectFields.mobile.objectFields,
                  // @ts-expect-error objectFields is not assignable to type ObjectField
                  grow: layoutField.objectFields.mobile.objectFields.grow,
                  // @ts-expect-error objectFields is not assignable to type ObjectField
                  alignSelf: layoutField.objectFields.mobile.objectFields.alignSelf,
                },
              },
            },
          },
        };
      }

      return {
        ...resolvedFields,
        layout: layoutField,
      };
    },
    inline: true,
    // @ts-expect-error bho
    render: (props) => {
      const { layout, ...otherProps } = props;

      return (
        <LayoutRender layout={layout} ref={props.puck.dragRef}>
          {componentConfig.render(otherProps)}
        </LayoutRender>
      );
    },
  };
}
