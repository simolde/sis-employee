import {
  LocateFixed,
  MapPin,
  RefreshCw,
} from "lucide-react";

type LocationCaptureProps = {
  required: boolean;

  latitude: string;
  longitude: string;
  address: string;

  isLocating: boolean;
  locationMessage: string;

  onRefreshLocation?:
    () =>
      | void
      | Promise<void>;

  disabled?: boolean;
};

function LocationStatusMessage({
  required,
  latitude,
  longitude,
  address,
  isLocating,
  locationMessage,
}: {
  required: boolean;

  latitude: string;
  longitude: string;
  address: string;

  isLocating: boolean;
  locationMessage: string;
}) {
  const hasLocation =
    Boolean(
      latitude &&
      longitude &&
      address,
    );

  if (isLocating) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
        {locationMessage ||
          "Requesting browser location permission..."}
      </div>
    );
  }

  if (hasLocation) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
        GPS coordinates and full address captured
        successfully.
      </div>
    );
  }

  if (!required) {
    return (
      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
        Location evidence is optional under the
        current Attendance Policy. You may capture
        it for additional verification.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
      {locationMessage ||
        "Location is required before submitting. Allow browser location permission and click Retry Location."}
    </div>
  );
}

export function LocationCapture({
  required,
  latitude,
  longitude,
  address,
  isLocating,
  locationMessage,
  onRefreshLocation,
  disabled = false,
}: LocationCaptureProps) {
  const hasLocation =
    Boolean(
      latitude &&
      longitude &&
      address,
    );

  return (
    <section className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-light-bg)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <LocateFixed
              className="h-5 w-5 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <h3 className="text-sm font-extrabold text-[var(--starland-dark-text)]">
              Automatic GPS and Full Address
            </h3>

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

          <p className="mt-2 text-xs leading-5 text-[var(--starland-muted-text)]">
            {required
              ? "Location is requested automatically when this page loads. Latitude, longitude, and address are read-only."
              : "Location is optional and is not requested automatically. Use Capture Location when additional evidence is needed."}
          </p>
        </div>

        {onRefreshLocation ? (
          <button
            type="button"
            className="starland-btn starland-btn-soft starland-btn-sm"
            onClick={() =>
              void onRefreshLocation()
            }
            disabled={
              disabled ||
              isLocating
            }
          >
            <RefreshCw
              className={[
                "h-4 w-4",

                isLocating
                  ? "animate-spin"
                  : "",
              ].join(" ")}
              aria-hidden="true"
            />

            {hasLocation
              ? "Retry Location"
              : "Capture Location"}
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        <LocationStatusMessage
          required={required}
          latitude={latitude}
          longitude={longitude}
          address={address}
          isLocating={isLocating}
          locationMessage={
            locationMessage
          }
        />
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
            className="starland-input mt-2"
            value={latitude}
            placeholder={
              required
                ? "Auto captured"
                : "Optional"
            }
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
            className="starland-input mt-2"
            value={longitude}
            placeholder={
              required
                ? "Auto captured"
                : "Optional"
            }
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
          className="starland-input mt-2 min-h-20 resize-y"
          value={address}
          placeholder={
            required
              ? "Full address will appear automatically."
              : "Optional location address"
          }
          readOnly
        />
      </div>

      {latitude &&
      longitude ? (
        <div className="mt-4 rounded-2xl border border-[var(--starland-border)] bg-white p-3 text-xs font-semibold text-[var(--starland-muted-text)]">
          <div className="flex items-start gap-2">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <p>
              Captured GPS:{" "}
              {latitude},{" "}
              {longitude}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}