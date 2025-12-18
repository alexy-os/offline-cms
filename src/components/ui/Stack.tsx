import type { ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import {
  spacingVariants,
  colorVariants,
  layoutVariants,
  flexVariants,
  textAlignVariants,
  type VariantSpacingProps,
  type ColorProps,
  type VariantLayoutProps,
  type VariantFlexProps,
  type TextAlignProps
} from "../../variants";

export interface StackProps 
  extends React.HTMLAttributes<HTMLElement>,
    Partial<Pick<VariantSpacingProps, 'p' | 'px' | 'py' | 'm' | 'mx' | 'my'>>,
    Partial<Pick<ColorProps, 'bg' | 'c'>>,
    Partial<Pick<VariantLayoutProps, 'w' | 'h'>>,
    Partial<Pick<VariantFlexProps, 'gap' | 'align' | 'justify' | 'direction'>>,
    Partial<TextAlignProps> {
  children: ReactNode;
  component?: ElementType;
}

export const Stack = forwardRef<HTMLElement, StackProps>(
  ({ 
    children, 
    className,
    component = 'div',
    gap = 'md',
    direction = 'col',
    align = 'start',
    justify = 'start',
    ta,
    // Spacing props
    p, px, py,
    m, mx, my,
    // Color props
    bg,
    c,
    // Layout props
    w,
    h,
    ...props 
  }, ref) => {
    const Element = component as ElementType;

    return (
      <Element
        ref={ref}
        data-class="stack"
        className={cn(
          flexVariants({ gap, align, justify, direction }),
          spacingVariants({ p, px, py, m, mx, my }),
          colorVariants({ bg, c }),
          layoutVariants({ w, h }),
          textAlignVariants({ ta }),
          className
        )}
        {...props}
      >
        {children}
      </Element>
    );
  }
);

Stack.displayName = "Stack"; 