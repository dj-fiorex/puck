import { AutoField, FieldLabel, type ObjectField } from '@measured/puck';
import { useMemo } from 'react';

type BaseLayoutFieldProps = {
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  zIndex?: number;
  width?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  spanCol?: number;
  spanRow?: number;
  grow?: boolean;
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  order?: number;
};

export type LayoutFieldProps = BaseLayoutFieldProps & {
  mobile?: BaseLayoutFieldProps;
};

const spacingOptions = [
  { label: '0px', value: '0px' },
  { label: '8px', value: '8px' },
  { label: '16px', value: '16px' },
  { label: '24px', value: '24px' },
  { label: '32px', value: '32px' },
  { label: '40px', value: '40px' },
  { label: '48px', value: '48px' },
  { label: '56px', value: '56px' },
  { label: '64px', value: '64px' },
  { label: '72px', value: '72px' },
  { label: '80px', value: '80px' },
  { label: '88px', value: '88px' },
  { label: '96px', value: '96px' },
  { label: '104px', value: '104px' },
  { label: '112px', value: '112px' },
  { label: '120px', value: '120px' },
  { label: '128px', value: '128px' },
  { label: '136px', value: '136px' },
  { label: '144px', value: '144px' },
  { label: '152px', value: '152px' },
  { label: '160px', value: '160px' },
];

const baseLayoutFields = {
  position: {
    type: 'select',
    label: 'Position',
    options: [
      { label: 'Static', value: 'static' },
      { label: 'Relative', value: 'relative' },
      { label: 'Absolute', value: 'absolute' },
      { label: 'Fixed', value: 'fixed' },
      { label: 'Sticky', value: 'sticky' },
    ],
  },
  zIndex: {
    label: 'Z Index',
    type: 'number',
    min: 1,
  },
  spanCol: {
    label: 'Grid Columns',
    type: 'number',
    min: 1,
    max: 12,
  },
  spanRow: {
    label: 'Grid Rows',
    type: 'number',
    min: 1,
    max: 12,
  },
  order: {
    label: 'Grid Order',
    type: 'number',
    min: 0,
  },
  grow: {
    label: 'Flex Grow',
    type: 'radio',
    options: [
      { label: 'true', value: true },
      { label: 'false', value: false },
    ],
  },
  alignSelf: {
    label: 'Align Self',
    type: 'radio',
    options: [
      { label: 'auto', value: 'auto' },
      { label: 'flex-start', value: 'flex-start' },
      { label: 'flex-end', value: 'flex-end' },
      { label: 'center', value: 'center' },
      { label: 'baseline', value: 'baseline' },
      { label: 'stretch', value: 'stretch' },
    ],
  },
  paddingTop: {
    type: 'custom',
    render: (props: any) => {
      const {
        onChange,
        value,
        field: { label = 'Padding Top' },
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
          <AutoField field={{ type: 'select', options: options }} onChange={onChange} value={value} />
          <AutoField field={{ type: 'text' }} onChange={onChange} value={value} />
        </FieldLabel>
      );
    },
  },
  paddingBottom: {
    type: 'custom',
    render: (props: any) => {
      const {
        onChange,
        value,
        field: { label = 'Padding Bottom' },
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
          <AutoField field={{ type: 'select', options: options }} onChange={onChange} value={value} />
          <AutoField field={{ type: 'text' }} onChange={onChange} value={value} />
        </FieldLabel>
      );
    },
  },

  paddingRight: {
    type: 'custom',
    render: (props: any) => {
      const {
        onChange,
        value,
        field: { label = 'Padding Right' },
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
          <AutoField field={{ type: 'select', options: options }} onChange={onChange} value={value} />
          <AutoField field={{ type: 'text' }} onChange={onChange} value={value} />
        </FieldLabel>
      );
    },
  },

  paddingLeft: {
    type: 'custom',
    render: (props: any) => {
      const {
        onChange,
        value,
        field: { label = 'Padding Left' },
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
          <AutoField field={{ type: 'select', options: options }} onChange={onChange} value={value} />
          <AutoField field={{ type: 'text' }} onChange={onChange} value={value} />
        </FieldLabel>
      );
    },
  },

  marginTop: {
    type: 'custom',
    render: (props: any) => {
      const {
        onChange,
        value,
        field: { label = 'Margin Top' },
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
          <AutoField field={{ type: 'select', options: options }} onChange={onChange} value={value} />
          <AutoField field={{ type: 'text' }} onChange={onChange} value={value} />
        </FieldLabel>
      );
    },
  },
  marginBottom: {
    type: 'custom',
    render: (props: any) => {
      const {
        onChange,
        value,
        field: { label = 'Margin Bottom' },
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
          <AutoField field={{ type: 'select', options: options }} onChange={onChange} value={value} />
          <AutoField field={{ type: 'text' }} onChange={onChange} value={value} />
        </FieldLabel>
      );
    },
  },

  marginRight: {
    type: 'custom',
    render: (props: any) => {
      const {
        onChange,
        value,
        field: { label = 'Margin Right' },
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
          <AutoField field={{ type: 'select', options: options }} onChange={onChange} value={value} />
          <AutoField field={{ type: 'text' }} onChange={onChange} value={value} />
        </FieldLabel>
      );
    },
  },

  marginLeft: {
    type: 'custom',
    render: (props: any) => {
      const {
        onChange,
        value,
        field: { label = 'Margin Left' },
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
          <AutoField field={{ type: 'select', options: options }} onChange={onChange} value={value} />
          <AutoField field={{ type: 'text' }} onChange={onChange} value={value} />
        </FieldLabel>
      );
    },
  },

  width: {
    type: 'text',
    label: 'Width',
  },
};

export const layoutField: ObjectField<LayoutFieldProps> = {
  type: 'object',
  objectFields: {
    ...baseLayoutFields,
    mobile: {
      type: 'object',
      // @ts-expect-error objectFields is not assignable to type ObjectField
      objectFields: {
        ...baseLayoutFields,
      },
    },
  },
};
