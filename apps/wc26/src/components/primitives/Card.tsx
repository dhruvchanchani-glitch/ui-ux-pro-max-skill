import { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  /** Identity (poster) cards are flat with 0 radius; utility cards are 16px + soft border. */
  layer?: "utility" | "identity" | "raised";
  padding?: "sm" | "md" | "lg" | "none";
  children?: ReactNode;
};

const layerClasses = {
  utility:
    "bg-surface rounded-md border border-hairline shadow-elev-1",
  identity: "rounded-none",
  raised: "bg-surface-raised rounded-lg shadow-elev-3",
};

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  layer = "utility",
  padding = "md",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <div
      className={`${layerClasses[layer]} ${paddingClasses[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
