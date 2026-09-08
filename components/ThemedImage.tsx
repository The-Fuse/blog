import type { ImgHTMLAttributes } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  /** Shown instead of `src` when the site is in dark mode. Optional. */
  darkSrc?: string | null;
};

/**
 * An image with an optional dark-mode version. Both are rendered and CSS shows the one that matches
 * the current `data-theme`, so switching themes on the page swaps the picture with no script.
 * With no dark version this is a plain <img>.
 */
export function ThemedImage({ src, darkSrc, className, alt = "", ...rest }: Props) {
  if (!darkSrc || darkSrc === src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} {...rest} />;
  }
  const cls = (extra: string) => (className ? `${className} ${extra}` : extra);
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={cls("img-light")} {...rest} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={darkSrc} alt={alt} className={cls("img-dark")} {...rest} />
    </>
  );
}
