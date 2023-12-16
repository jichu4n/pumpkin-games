import {ReactNode} from 'react';

export function Toolbar({children}: {children: ReactNode}) {
  return (
    <div className="position-fixed top-0 end-0 p-2 ps-4 pb-4 d-flex flex-row gap-2">
      {children}
    </div>
  );
}
