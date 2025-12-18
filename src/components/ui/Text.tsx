import type { ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import {
  spacingVariants,
  colorVariants,
  layoutVariants,
  textSizeVariants,
  fontWeightVariants,
  textAlignVariants,
  leadingVariants,
  typographyModifierVariants,
  trackingVariants,
  type VariantSpacingProps,
  type ColorProps,
  type VariantLayoutProps,
  type TextSizeProps,
  type FontWeightProps,
  type TextAlignProps,
  type LeadingProps,
  type TypographyModifierProps,
  type TrackingProps
} from "../../variants";

export interface TextProps 
  extends React.HTMLAttributes<HTMLElement>,
    Partial<Pick<VariantSpacingProps, 'm' | 'mx' | 'my' | 'mb' | 'mt'>>,
    Partial<Pick<ColorProps, 'c'>>,
    Partial<Pick<VariantLayoutProps, 'w'>>,
    Partial<TextSizeProps>,
    Partial<FontWeightProps>,
    Partial<TextAlignProps>,
    Partial<LeadingProps>,
    Partial<TrackingProps>,
    Partial<TypographyModifierProps> {
  children: ReactNode;
  component?: ElementType;
}

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ 
    children, 
    className,
    component = 'p',
    size = 'md',
    fw = 'normal',
    ta,
    leading = 'normal',
    tracking,
    truncate = false,
    italic = false,
    underline = false,
    // Spacing props
    m, mx, my, mb, mt,
    // Color props
    c = 'foreground',
    // Layout props
    w,
    ...props 
  }, ref) => {
    const Element = component as ElementType;

    return (
      <Element
        ref={ref}
        data-class="text"
        className={cn(
          textSizeVariants({ size }),
          fontWeightVariants({ fw }),
          textAlignVariants({ ta }),
          leadingVariants({ leading }),
          trackingVariants({ tracking }),
          typographyModifierVariants({ truncate, italic, underline }),
          spacingVariants({ m, mx, my, mb, mt }),
          colorVariants({ c }),
          layoutVariants({ w }),
          className
        )}
        {...props}
      >
        {children}
      </Element>
    );
  }
);

Text.displayName = "Text"; 