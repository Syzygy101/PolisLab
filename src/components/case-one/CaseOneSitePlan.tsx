import type { ReactNode } from 'react';
import './case-one.css';

export const CASE_ONE_QUESTION = 'What keeps a new supermarket out?';

type SiteFocus = 'viability' | 'permission' | 'waiting' | 'control';

/** A built illustration shared by the entrance and the evidence workbench. */
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
        {children}
      </div>
      <figcaption>Illustrative site plan · no real parcel data</figcaption>
    </figure>
  );
}
