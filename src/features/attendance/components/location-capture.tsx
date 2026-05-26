"use client";

type LocationCaptureProps = {
  latitude: string;
  longitude: string;
  address: string;
  isLocating: boolean;
  locationMessage: string;
};

export function LocationCapture({
  latitude,
  longitude,
  address,
  isLocating,
  locationMessage,
}: LocationCaptureProps) {
  const hasLocation = Boolean(latitude && longitude && address);

  return (
    <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <div>
        <p className="text-sm font-extrabold text-[var(--starland-dark-text)]">
          Automatic GPS and Full Address
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--starland-muted-text)]">
          Location is requested immediately when this page loads. Latitude and
          longitude are read-only, and full address is generated automatically.
        </p>
      </div>

      {isLocating ? (
        <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-700">
          Getting GPS and converting to full address...
        </div>
      ) : hasLocation ? (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
          Location captured successfully.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
          Location is required before submitting. Please allow browser location
          permission and reload the page.
        </div>
      )}

      {locationMessage ? (
        <div className="mt-3 rounded-2xl border border-[var(--starland-border)] bg-white p-3 text-sm font-semibold text-[var(--starland-dark-text)]">
          {locationMessage}
        </div>
      ) : null}

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
          placeholder="Full address will appear automatically."
          readOnly
        />
      </div>
    </div>
  );
}