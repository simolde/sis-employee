"use client";

type LocationCaptureProps = {
  latitude: string;
  longitude: string;
  address: string;
  disabled: boolean;
  isLocating: boolean;
  onRefresh: () => void;
};

export function LocationCapture({
  latitude,
  longitude,
  address,
  disabled,
  isLocating,
  onRefresh,
}: LocationCaptureProps) {
  return (
    <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-[var(--starland-dark-text)]">
            Automatic GPS and Address
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--starland-muted-text)]">
            GPS and full address are captured automatically when you click
            submit. The values are read-only to prevent manual editing.
          </p>
        </div>

        <button
          type="button"
          className="starland-btn starland-btn-soft starland-btn-sm"
          onClick={onRefresh}
          disabled={disabled || isLocating}
        >
          {isLocating ? "Getting Location..." : "Refresh GPS"}
        </button>
      </div>

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
          placeholder="Full address will be converted automatically from GPS."
          readOnly
        />
      </div>
    </div>
  );
}