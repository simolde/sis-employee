"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Camera,
  Loader2,
  RefreshCcw,
  Upload,
} from "lucide-react";
import type { AttendancePhotoUploadResponse } from "../types/attendance-upload-types";

type WebcamCaptureProps = {
  required: boolean;
  maxPhotoSizeMb: number;

  disabled: boolean;

  photoPath: string;

  onPhotoPathChange:
    (path: string) => void;

  errorMessages?: string[];
};

function dataUrlToFile(
  dataUrl: string,
  fileName: string,
): File {
  const [
    header = "",
    base64Data = "",
  ] = dataUrl.split(",");

  const mimeMatch =
    header.match(
      /data:(.*?);base64/u,
    );

  const mimeType =
    mimeMatch?.[1] ??
    "image/jpeg";

  const binaryString =
    window.atob(
      base64Data,
    );

  const bytes =
    new Uint8Array(
      binaryString.length,
    );

  for (
    let index = 0;
    index <
    binaryString.length;
    index += 1
  ) {
    bytes[index] =
      binaryString.charCodeAt(
        index,
      );
  }

  return new File(
    [bytes],
    fileName,
    {
      type:
        mimeType,
    },
  );
}

function FieldError({
  messages,
}: {
  messages?: string[];
}) {
  if (
    !messages ||
    messages.length === 0
  ) {
    return null;
  }

  return (
    <p className="mt-2 text-xs font-semibold text-[var(--starland-danger)]">
      {messages[0]}
    </p>
  );
}

export function WebcamCapture({
  required,
  maxPhotoSizeMb,
  disabled,
  photoPath,
  onPhotoPathChange,
  errorMessages,
}: WebcamCaptureProps) {
  const videoRef =
    useRef<HTMLVideoElement | null>(
      null,
    );

  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null,
    );

  const streamRef =
    useRef<MediaStream | null>(
      null,
    );

  const [
    photoPreview,
    setPhotoPreview,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    isCameraActive,
    setIsCameraActive,
  ] = useState(false);

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  function stopCamera() {
    streamRef.current
      ?.getTracks()
      .forEach(
        (track) =>
          track.stop(),
      );

    streamRef.current =
      null;

    setIsCameraActive(
      false,
    );
  }

  async function startCamera() {
    setMessage("");

    if (
      !navigator.mediaDevices
        ?.getUserMedia
    ) {
      setMessage(
        "Camera is not supported by this browser.",
      );

      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode:
              "user",

            width: {
              ideal: 640,
            },

            height: {
              ideal: 480,
            },
          },

          audio: false,
        });

      streamRef.current =
        stream;

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;
      }

      setIsCameraActive(
        true,
      );
    } catch {
      setMessage(
        "Unable to open camera. Please allow camera permission.",
      );
    }
  }

  async function uploadCapturedPhoto(
    dataUrl: string,
  ) {
    setIsUploading(true);
    setMessage("");

    try {
      const file =
        dataUrlToFile(
          dataUrl,
          "attendance-selfie.jpg",
        );

      const maxBytes =
        maxPhotoSizeMb *
        1024 *
        1024;

      if (
        file.size >
        maxBytes
      ) {
        setMessage(
          `Captured image is too large. Maximum size is ${maxPhotoSizeMb} MB.`,
        );

        onPhotoPathChange("");

        return;
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      const response =
        await fetch(
          "/api/uploads/attendance-photo",
          {
            method:
              "POST",

            body:
              formData,
          },
        );

      const result =
        await response.json() as
          AttendancePhotoUploadResponse;

      if (
        !response.ok ||
        !result.ok ||
        !result.path
      ) {
        setMessage(
          result.message ||
            "Failed to upload selfie photo.",
        );

        onPhotoPathChange("");

        return;
      }

      onPhotoPathChange(
        result.path,
      );

      setMessage(
        "Selfie captured and uploaded successfully.",
      );
    } catch {
      setMessage(
        "Unable to upload selfie photo.",
      );

      onPhotoPathChange("");
    } finally {
      setIsUploading(
        false,
      );
    }
  }

  async function capturePhoto() {
    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    if (
      !video ||
      !canvas
    ) {
      setMessage(
        "Camera is not ready.",
      );

      return;
    }

    const width =
      video.videoWidth ||
      640;

    const height =
      video.videoHeight ||
      480;

    canvas.width =
      width;

    canvas.height =
      height;

    const context =
      canvas.getContext(
        "2d",
      );

    if (!context) {
      setMessage(
        "Unable to capture selfie.",
      );

      return;
    }

    context.drawImage(
      video,
      0,
      0,
      width,
      height,
    );

    const dataUrl =
      canvas.toDataURL(
        "image/jpeg",
        0.85,
      );

    setPhotoPreview(
      dataUrl,
    );

    await uploadCapturedPhoto(
      dataUrl,
    );
  }

  function clearPhoto() {
    setPhotoPreview("");
    onPhotoPathChange("");
    setMessage("");
  }

  useEffect(() => {
    return () => {
      streamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop(),
        );
    };
  }, []);

  const isDisabled =
    disabled ||
    isUploading;

  return (
    <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <input
        id="photoPath"
        type="hidden"
        name="photoPath"
        value={photoPath}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-extrabold text-[var(--starland-dark-text)]">
              Uniform Selfie
            </p>

            <span
              className={[
                "starland-badge",

                required
                  ? "starland-badge-warning"
                  : "starland-badge-info",
              ].join(" ")}
            >
              {required
                ? "REQUIRED"
                : "OPTIONAL"}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-[var(--starland-muted-text)]">
            {required
              ? "Take a selfie while wearing the proper Starland uniform before submitting attendance."
              : "A selfie is optional under the current Attendance Policy but may be captured for additional verification."}
          </p>

          <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
            Maximum image size:{" "}
            {maxPhotoSizeMb} MB
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isCameraActive ? (
            <button
              type="button"
              className="starland-btn starland-btn-soft starland-btn-sm"
              onClick={
                startCamera
              }
              disabled={
                isDisabled
              }
            >
              <Camera
                className="h-4 w-4"
                aria-hidden="true"
              />

              Open Camera
            </button>
          ) : (
            <button
              type="button"
              className="starland-btn starland-btn-secondary starland-btn-sm"
              onClick={
                stopCamera
              }
              disabled={
                isDisabled
              }
            >
              Stop Camera
            </button>
          )}

          <button
            type="button"
            className="starland-btn starland-btn-primary starland-btn-sm"
            onClick={
              capturePhoto
            }
            disabled={
              isDisabled ||
              !isCameraActive
            }
          >
            {isUploading ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />

                Uploading...
              </>
            ) : (
              <>
                <Upload
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Capture Selfie
              </>
            )}
          </button>

          <button
            type="button"
            className="starland-btn starland-btn-secondary starland-btn-sm"
            onClick={
              clearPhoto
            }
            disabled={
              isDisabled ||
              !photoPath
            }
          >
            <RefreshCcw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Clear
          </button>
        </div>
      </div>

      {photoPath ? (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
          Selfie captured successfully.
        </div>
      ) : required ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
          Selfie is required before submitting
          attendance.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-700">
          Selfie is optional. Attendance may be
          submitted without a photo.
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-[var(--starland-border)] bg-black">
          <video
            ref={videoRef}
            className="aspect-video w-full object-cover"
            autoPlay
            muted
            playsInline
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--starland-border)] bg-white">
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                photoPreview
              }
              alt="Captured attendance selfie preview"
              className="aspect-video w-full object-cover"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-[var(--starland-muted-text)]">
              Captured selfie preview will appear
              here.
            </div>
          )}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {photoPath ? (
        <p className="mt-3 break-all text-xs font-semibold text-[var(--starland-muted-text)]">
          Saved path:{" "}
          {photoPath}
        </p>
      ) : null}

      <FieldError
        messages={
          errorMessages
        }
      />

      {message ? (
        <div className="mt-4 rounded-2xl border border-[var(--starland-border)] bg-white p-3 text-sm font-semibold text-[var(--starland-dark-text)]">
          {message}
        </div>
      ) : null}
    </div>
  );
}