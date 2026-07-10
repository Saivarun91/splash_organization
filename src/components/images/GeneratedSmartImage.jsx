"use client";

import SmartImage from "@/utils/SmartImage";
import { isHttpUrl } from "@/utils/imagehelper";

/** Resolve primary (local) and fallback (Cloudinary) URLs from a generated image object. */
export function getGeneratedImageSources(image) {
  if (!image) {
    return { src: "", fallbackSrc: "" };
  }

  const primary =
    image.generated_image_path ||
    image.local_path ||
    image.local ||
    "";

  const urlField =
    image.generated_image_url ||
    image.image_url ||
    image.cloud_url ||
    image.cloud ||
    "";

  if (isHttpUrl(urlField)) {
    const fallbackSrc =
      urlField && image.id ? `${urlField}?v=${image.id}` : urlField;

    return {
      src: primary || "",
      fallbackSrc,
    };
  }

  const cacheKey = image.mongo_id || image.id;
  const primaryWithCache =
    primary && cacheKey && !isHttpUrl(primary) ? `${primary}?v=${cacheKey}` : primary;

  return {
    src: primaryWithCache || urlField || "",
    fallbackSrc: "",
  };
}

export function getProductImageSources(product) {
  if (!product) {
    return { src: "", fallbackSrc: "" };
  }

  return {
    src: product.uploaded_image_path || "",
    fallbackSrc: product.uploaded_image_url || "",
  };
}

export function getModelImageSources(model) {
  if (!model) {
    return { src: "", fallbackSrc: "" };
  }

  return {
    src: model.local_path || model.local || model.local_url || "",
    fallbackSrc: model.cloud_url || model.cloud || "",
  };
}

export function getMoodboardImageSources(image) {
  if (!image) {
    return { src: "", fallbackSrc: "" };
  }

  return {
    src: image.local_path || image.local_url || "",
    fallbackSrc: image.cloud_url || image.url || "",
  };
}

export function getGalleryImageSources(image) {
  if (!image) {
    return { src: "", fallbackSrc: "" };
  }

  return {
    src: image.local_path || image.local_url || image.local || "",
    fallbackSrc: image.cloud_url || image.url || image.image_url || "",
  };
}

/** Build a viewer item with local path + Cloudinary fallback for openImageViewer. */
export function toViewerItem(image, label) {
  const { src, fallbackSrc } = getGeneratedImageSources(image);

  return {
    localPath: src,
    url: fallbackSrc,
    label,
  };
}

export default function GeneratedSmartImage({ image, alt = "Generated image", ...props }) {
  const { src, fallbackSrc } = getGeneratedImageSources(image);

  return (
    <SmartImage
      src={src}
      fallbackSrc={fallbackSrc}
      alt={alt}
      {...props}
    />
  );
}
