"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { buildMediaUrl, getImageUrl, isHttpUrl } from "@/utils/imagehelper";

function shouldUseUnoptimized(url) {
  if (!url) return false;

  return (
    url.includes("127.0.0.1") ||
    url.includes("localhost") ||
    url.includes("res.cloudinary.com") ||
    url.includes("ik.imagekit.io") ||
    url.startsWith("/media/")
  );
}

async function resolveSource(src) {
  if (!src) return "";

  if (isHttpUrl(src)) {
    return src;
  }

  const available = await getImageUrl(src);
  return available || buildMediaUrl(src);
}

export default function SmartImage({
  src,
  fallbackSrc,
  alt = "",
  unoptimized: unoptimizedProp,
  ...props
}) {
  const [imageSrc, setImageSrc] = useState("");
  const [resolvedFallback, setResolvedFallback] = useState("");

  useEffect(() => {
    let cancelled = false;

    const resolveImage = async () => {
      const primary = await resolveSource(src);

      if (cancelled) return;

      const fallback = fallbackSrc
        ? isHttpUrl(fallbackSrc)
          ? fallbackSrc
          : await resolveSource(fallbackSrc)
        : "";

      if (cancelled) return;

      setResolvedFallback(fallback);
      setImageSrc(primary || fallback);
    };

    setImageSrc("");
    setResolvedFallback("");
    resolveImage();

    return () => {
      cancelled = true;
    };
  }, [src, fallbackSrc]);

  const displaySrc = imageSrc || resolvedFallback;

  if (!displaySrc) {
    return null;
  }

  const useUnoptimized = unoptimizedProp ?? shouldUseUnoptimized(displaySrc);

  return (
    <Image
      {...props}
      src={displaySrc}
      alt={alt}
      unoptimized={useUnoptimized}
      onError={() => {
        const fallback =
          resolvedFallback ||
          (fallbackSrc
            ? isHttpUrl(fallbackSrc)
              ? fallbackSrc
              : buildMediaUrl(fallbackSrc)
            : "");

        if (fallback && imageSrc !== fallback) {
          setImageSrc(fallback);
        }
      }}
    />
  );
}
