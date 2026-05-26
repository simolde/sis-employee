"use client";

type LocationCaptureProps = {
  latitude: string;
  longitude: string;
  address: string;
  disabled: boolean;
  isLocating: boolean;
  onGetLocation: () => void;
};

export function LocationCapture({
  latitude,
  longitude,
  address,
  disabled,
  isLocating,
  onGetLocation,
}: LocationCaptureProps) {
  const hasLocation = Boolean(latitude && longitude && address);

  return (
    <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-[var(--starland-dark-text)]">
            Required GPS and Full Address
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--starland-muted-text)]">
            Click Get Location before submitting. Latitude and longitude are
            read-only, and the full address is converted automatically.
          </p>
        </div>

        <button
          type="button"
          className="starland-btn starland-btn-primary starland-btn-sm"
          onClick={onGetLocation}
          disabled={disabled || isLocating}
        >
          {isLocating ? "Getting Location..." : "Get Location"}
        </button>
      </div>

      {hasLocation ? (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
          Location captured successfully.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
          Location is required before submitting attendance.
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <label
            htmlFor="latitude"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Latitude
          </label>
          <input
            id="latitude"
            name="latitude"
            className="starland-input mt-2 bg-slate-50"
            value={latitude}
            placeholder="Auto captured"
            readOnly
          />
        </div>

        <div>
          <label
            htmlFor="longitude"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Longitude
          </label>
          <input
            id="longitude"
            name="longitude"
            className="starland-input mt-2 bg-slate-50"
            value={longitude}
            placeholder="Auto captured"
            readOnly
          />
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="address"
          className="text-sm font-bold text-[var(--starland-dark-text)]"
        >
          Full Address
        </label>
        <textarea
          id="address"
          name="address"
          className="starland-input mt-2 min-h-24 resize-y bg-slate-50"
          value={address}
          placeholder="Full address will appear here after GPS capture."
          readOnly
        />
      </div>
    </div>
  );
}