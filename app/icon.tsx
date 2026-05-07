import { ImageResponse } from "next/og";

export const size = {
  width: 192,
  height: 192,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#111827",
          color: "#ffffff",
          display: "flex",
          fontSize: 64,
          fontWeight: 700,
          height: "100%",
          justifyContent: "center",
          width: "100%",
          borderRadius: 24,
        }}
      >
        B2
      </div>
    ),
    { ...size },
  );
}
