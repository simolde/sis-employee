"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Clock,
  Loader2,
  Save,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { recordOdlAttendanceAction } from "../server/attendance-actions";
import { initialAttendanceActionState } from "../types/attendance-action-state";
import type { OdlAttendancePageData } from "../types/attendance-form-types";
import { getBrowserLocationWithAddress } from "../utils/browser-location";
import { LocationCapture } from "./location-capture";
import { WebcamCapture } from "./webcam-capture";

type TimeInOutFormProps = {
  pageData:
    OdlAttendancePageData;
};

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
    <p className="mt-1 text-xs font-semibold text-[var(--starland-danger)]">
      {messages[0]}
    </p>
  );
}

function getPunchLabel(
  punchState:
    OdlAttendancePageData["punchState"],
): string {
  switch (punchState) {
    case "TIME_IN":
      return "TIME IN";

    case "TIME_OUT":
      return "TIME OUT";

    case "WAITING":
      return "WAITING";

    case "DONE":
      return "COMPLETED";

    case "BLOCKED":
      return "BLOCKED";
  }
}

function getReadinessMessage(input: {
  canPunch: boolean;
  hasPhoto: boolean;
  hasLocation: boolean;
  requirePhoto: boolean;
  requireLocation: boolean;

  punchState:
    OdlAttendancePageData["punchState"];
}): string {
  if (!input.canPunch) {
    return "Attendance submission is currently blocked for this account.";
  }

  const photoReady =
    !input.requirePhoto ||
    input.hasPhoto;

  const locationReady =
    !input.requireLocation ||
    input.hasLocation;

  if (
    !photoReady &&
    !locationReady
  ) {
    return "Required before submit: uniform selfie, GPS coordinates, and full address.";
  }

  if (!photoReady) {
    return "Required before submit: please capture a uniform selfie.";
  }

  if (!locationReady) {
    return "Required before submit: capture GPS coordinates and full address.";
  }

  if (
    !input.requirePhoto &&
    !input.requireLocation
  ) {
    return `No photo or location evidence is required. Ready to submit ${getPunchLabel(
      input.punchState,
    )}.`;
  }

  if (
    !input.requirePhoto &&
    input.requireLocation
  ) {
    return `Location evidence is ready. Selfie is optional. Ready to submit ${getPunchLabel(
      input.punchState,
    )}.`;
  }

  if (
    input.requirePhoto &&
    !input.requireLocation
  ) {
    return `Selfie evidence is ready. Location is optional. Ready to submit ${getPunchLabel(
      input.punchState,
    )}.`;
  }

  return `All required evidence is ready. Submit ${getPunchLabel(
    input.punchState,
  )}.`;
}

function EvidencePolicySummary({
  requirePhoto,
  requireLocation,
  maxPhotoSizeMb,
}: {
  requirePhoto: boolean;
  requireLocation: boolean;
  maxPhotoSizeMb: number;
}) {
  return (
    <section className="starland-card p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-main-green)]"
          aria-hidden="true"
        />

        <div>
          <h3 className="font-extrabold text-[var(--starland-dark-text)]">
            Current Evidence Policy
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={[
                "starland-badge",
                requirePhoto
                  ? "starland-badge-warning"
                  : "starland-badge-info",
              ].join(" ")}
            >
              Selfie:{" "}
              {requirePhoto
                ? "REQUIRED"
                : "OPTIONAL"}
            </span>

            <span
              className={[
                "starland-badge",
                requireLocation
                  ? "starland-badge-warning"
                  : "starland-badge-info",
              ].join(" ")}
            >
              Location:{" "}
              {requireLocation
                ? "REQUIRED"
                : "OPTIONAL"}
            </span>

            <span className="starland-badge starland-badge-success">
              Maximum photo:{" "}
              {maxPhotoSizeMb} MB
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TimeInOutForm({
  pageData,
}: TimeInOutFormProps) {
  const {
    requirePhoto,
    requireLocation,
    maxPhotoSizeMb,
  } = pageData.evidencePolicy;

  const [
    clientMessage,
    setClientMessage,
  ] = useState("");

  const [
    locationMessage,
    setLocationMessage,
  ] = useState("");

  const [
    photoPath,
    setPhotoPath,
  ] = useState("");

  const [
    latitude,
    setLatitude,
  ] = useState("");

  const [
    longitude,
    setLongitude,
  ] = useState("");

  const [
    address,
    setAddress,
  ] = useState("");

  const [
    isLocating,
    setIsLocating,
  ] = useState(
    requireLocation,
  );

  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    recordOdlAttendanceAction,
    initialAttendanceActionState,
  );

  const captureLocation =
    useCallback(
      async () => {
        setIsLocating(true);

        setLocationMessage(
          "Requesting location permission...",
        );

        setClientMessage("");

        try {
          const location =
            await getBrowserLocationWithAddress();

          setLatitude(
            location.latitude,
          );

          setLongitude(
            location.longitude,
          );

          setAddress(
            location.address,
          );

          setLocationMessage(
            "GPS and full address captured successfully.",
          );
        } catch (error) {
          setLatitude("");
          setLongitude("");
          setAddress("");

          setLocationMessage(
            error instanceof Error
              ? error.message
              : "Unable to capture GPS and full address.",
          );
        } finally {
          setIsLocating(
            false,
          );
        }
      },
      [],
    );

  useEffect(() => {
    if (!requireLocation) {
      return;
    }

    const timer = window.setTimeout(() => {
      void captureLocation();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [captureLocation, requireLocation]);

  const canPunch =
    pageData.punchState ===
      "TIME_IN" ||
    pageData.punchState ===
      "TIME_OUT";

  const hasPhoto =
    Boolean(photoPath);

  const hasLocation =
    Boolean(
      latitude &&
      longitude &&
      address,
    );

  const photoReady =
    !requirePhoto ||
    hasPhoto;

  const locationReady =
    !requireLocation ||
    hasLocation;

  const isSubmitBusy =
    isPending ||
    isLocating;

  const isReadyToSubmit =
    Boolean(
      canPunch &&
      photoReady &&
      locationReady,
    );

  const readinessMessage =
    getReadinessMessage({
      canPunch,
      hasPhoto,
      hasLocation,
      requirePhoto,
      requireLocation,

      punchState:
        pageData.punchState,
    });

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    setClientMessage("");

    if (!canPunch) {
      event.preventDefault();

      setClientMessage(
        pageData.message,
      );

      return;
    }

    if (
      requirePhoto &&
      !photoPath
    ) {
      event.preventDefault();

      setClientMessage(
        "Please capture a uniform selfie before submitting.",
      );

      return;
    }

    if (
      requireLocation &&
      (
        !latitude ||
        !longitude ||
        !address
      )
    ) {
      event.preventDefault();

      setClientMessage(
        "Location and full address are required. Click Retry Location and allow browser location permission.",
      );
    }
  }

  return (
    <div className="space-y-5">
      <EvidencePolicySummary
        requirePhoto={
          requirePhoto
        }
        requireLocation={
          requireLocation
        }
        maxPhotoSizeMb={
          maxPhotoSizeMb
        }
      />

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            ODL Web Attendance
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            ODL Teacher Time-In /
            Time-Out
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
            The system automatically decides whether
            the next submission is TIME IN or TIME OUT.
            Evidence requirements follow the current
            Attendance Policy settings.
          </p>
        </div>

        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-6"
        >
          {state.message ? (
            <div
              className={[
                "rounded-2xl border px-4 py-3 text-sm font-semibold",

                state.ok
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700",
              ].join(" ")}
            >
              {state.message}
            </div>
          ) : null}

          {clientMessage ? (
            <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] px-4 py-3 text-sm font-semibold text-[var(--starland-dark-text)]">
              {clientMessage}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
              <div className="mb-3 flex items-center gap-2">
                <UserCheck
                  className="h-5 w-5 text-[var(--starland-main-green)]"
                  aria-hidden="true"
                />

                <h3 className="text-sm font-extrabold text-[var(--starland-dark-text)]">
                  Logged-in ODL Teacher
                </h3>
              </div>

              {pageData.employee ? (
                <div className="space-y-2 text-sm text-[var(--starland-muted-text)]">
                  <p className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                    {
                      pageData
                        .employee
                        .fullName
                    }
                  </p>

                  <p>
                    {
                      pageData
                        .employee
                        .empNumber
                    }
                  </p>

                  <p>
                    {
                      pageData
                        .employee
                        .departmentName
                    }
                  </p>

                  <p>
                    {
                      pageData
                        .employee
                        .designationName
                    }
                  </p>

                  <p>
                    {
                      pageData
                        .employee
                        .branchName
                    }
                  </p>

                  <p>
                    Schedule:{" "}
                    {
                      pageData
                        .employee
                        .scheduleName
                    }
                  </p>
                </div>
              ) : (
                <p className="text-sm font-semibold text-[var(--starland-danger)]">
                  No employee profile found.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--starland-border)] bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Clock
                  className="h-5 w-5 text-[var(--starland-main-green)]"
                  aria-hidden="true"
                />

                <h3 className="text-sm font-extrabold text-[var(--starland-dark-text)]">
                  Today&apos;s Attendance Status
                </h3>
              </div>

              <span
                className={[
                  "starland-badge",

                  canPunch
                    ? "starland-badge-success"
                    : "starland-badge-warning",
                ].join(" ")}
              >
                NEXT ACTION:{" "}
                {getPunchLabel(
                  pageData.punchState,
                )}
              </span>

              <p className="mt-4 text-sm font-semibold text-[var(--starland-dark-text)]">
                {pageData.message}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                    Time In
                  </p>

                  <p className="mt-1 font-bold text-[var(--starland-dark-text)]">
                    {
                      pageData
                        .timeInAt
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                    Time Out
                  </p>

                  <p className="mt-1 font-bold text-[var(--starland-dark-text)]">
                    {
                      pageData
                        .timeOutAt
                    }
                  </p>
                </div>
              </div>

              {pageData.punchState ===
              "WAITING" ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
                  Time-out available in{" "}
                  {
                    pageData
                      .minutesUntilTimeout
                  }{" "}
                  minute(s).
                </div>
              ) : null}
            </div>
          </div>

          <WebcamCapture
            required={
              requirePhoto
            }
            maxPhotoSizeMb={
              maxPhotoSizeMb
            }
            disabled={
              isPending
            }
            photoPath={
              photoPath
            }
            onPhotoPathChange={
              setPhotoPath
            }
            errorMessages={
              state.fieldErrors
                ?.photoPath
            }
          />

          {!canPunch ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              Evidence tools remain available for
              testing, but attendance submission is
              blocked for this account.
            </div>
          ) : null}

          <LocationCapture
            required={
              requireLocation
            }
            latitude={
              latitude
            }
            longitude={
              longitude
            }
            address={
              address
            }
            isLocating={
              isLocating
            }
            locationMessage={
              locationMessage
            }
            onRefreshLocation={
              captureLocation
            }
            disabled={
              isPending
            }
          />

          <FieldError
            messages={
              state.fieldErrors
                ?.latitude
            }
          />

          <FieldError
            messages={
              state.fieldErrors
                ?.longitude
            }
          />

          <FieldError
            messages={
              state.fieldErrors
                ?.address
            }
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label
                htmlFor="remarks"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Remarks
              </label>

              <textarea
                id="remarks"
                name="remarks"
                className="starland-input mt-2 min-h-24 resize-y"
                placeholder="Optional remarks"
                disabled={
                  isSubmitBusy ||
                  !canPunch
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.remarks
                }
              />
            </div>

            <div>
              <label
                htmlFor="reason"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Reason
              </label>

              <textarea
                id="reason"
                name="reason"
                className="starland-input mt-2 min-h-24 resize-y"
                placeholder="Optional reason"
                disabled={
                  isSubmitBusy ||
                  !canPunch
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.reason
                }
              />
            </div>
          </div>

          <div
            className={[
              "rounded-2xl border p-4 text-sm font-semibold",

              isReadyToSubmit
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-amber-200 bg-amber-50 text-amber-700",
            ].join(" ")}
          >
            {readinessMessage}
          </div>

          <button
            type="submit"
            className="starland-btn starland-btn-primary w-full"
            disabled={
              isSubmitBusy ||
              !isReadyToSubmit
            }
          >
            {isSubmitBusy ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />

                {isLocating
                  ? "Getting Location..."
                  : "Recording..."}
              </>
            ) : (
              <>
                <Save
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Submit{" "}
                {getPunchLabel(
                  pageData.punchState,
                )}
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}