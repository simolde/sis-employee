"use client";

type WebcamCaptureProps = {
  disabled: boolean;
};

export function WebcamCapture({ disabled }: WebcamCaptureProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <p className="text-sm font-bold text-[var(--starland-dark-text)]">
        Webcam Capture
      </p>
      <p className="mt-1 text-xs leading-5 text-[var(--starland-muted-text)]">
        Webcam image capture will be added next. For now, enter a saved local
        photo path below.
      </p>

      <input
        id="photoPath"
        name="photoPath"
        className="starland-input mt-3"
        placeholder="uploads/attendance/photo.jpg"
        disabled={disabled}
      />
    </div>
  );
}