export function isHttpUrl(src) {
  return /^https?:\/\//i.test(src || "");
}

export function buildMediaUrl(src) {
  if (!src) return "";

  if (isHttpUrl(src)) {
    return src;
  }

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const baseUrl = API_URL.replace(/\/$/, "");

  let cleanPath = src.trim().replace(/\\/g, "/");

  const mediaIndex = cleanPath.toLowerCase().indexOf("/media/");

  if (mediaIndex !== -1) {
    cleanPath = cleanPath.substring(mediaIndex);
  } else {
    cleanPath = cleanPath.replace(/^\/+/, "");

    if (!cleanPath.startsWith("media/")) {
      cleanPath = `media/${cleanPath}`;
    }

    cleanPath = `/${cleanPath}`;
  }

  return `${baseUrl}${cleanPath}`;
}

export const getImageUrl = async (src) => {
  if (!src) return "";

  if (isHttpUrl(src)) {
    return src;
  }

  const url = buildMediaUrl(src);

  try {
    const response = await fetch(url, { method: "HEAD" });
    if (response.ok) {
      return url;
    }

    const getResponse = await fetch(url, { method: "GET" });
    return getResponse.ok ? url : null;
  } catch {
    return null;
  }
};
