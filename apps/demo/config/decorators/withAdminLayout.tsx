// Wrapper of the withLayout to be able to control responsive with usePuck

import { createUsePuck } from "@/core/lib/use-puck";
import { merge } from "lodash";

const usePuck = createUsePuck();

export const withAdminLayout = (originalWithLayout: any) => ({
  ...originalWithLayout,
  render: (props) => {
    const { puck, layout, ...otherProps } = props;
    const { mobile = {}, ...desktopLayot } = layout ?? {};
    const isMobile = usePuck(
      (s) => s.appState.ui.viewports.current.width < 640,
    );
    
    const correctLayout = isMobile
      ? merge({}, desktopLayot, mobile)
      : desktopLayot;

    return originalWithLayout.render({ ...props, layout: correctLayout });
  },
});
