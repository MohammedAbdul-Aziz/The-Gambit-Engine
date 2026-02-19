
import { cn } from '@/lib/utils';
import * as React from 'react';

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <div className="h-full w-full rounded-[inherit] overflow-y-auto pr-4">
      {children}
    </div>
    <div className="absolute top-0 right-0 h-full w-2 bg-transparent" />
  </div>
));
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
