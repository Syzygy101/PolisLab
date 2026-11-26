import type { ReactNode } from 'react';

type SiteFocus = 'viability' | 'permission' | 'waiting' | 'control';

/** Schematic used in the undeveloped-site investigation. */
export function CaseOneSitePlan({ children, focus }: { children?: ReactNode; focus?: SiteFocus }) {
  return (
    <figure className="site-plan" data-focus={focus}>
      <div className="site-plan-field">
        <div className="site-plan-drawing" aria-hidden="true">
          <span className="site-plan-land site-plan-land--north" />
          <span className="site-plan-land site-plan-land--west" />
          <span className="site-plan-land site-plan-land--east" />
          <span className="site-plan-land site-plan-land--south" />
          <span className="site-plan-road" />
          <span className="site-plan-parcel"><span>Unused site</span></span>
        </div>
      </div>
      {children}
      <figcaption>Illustrative site plan · no real parcel data</figcaption>
    </figure>
  );
}
