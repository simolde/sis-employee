"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useActionState } from "react";
import { Clock, Loader2, Save, UserCheck } from "lucide-react";
import { recordOdlAttendanceAction } from "../server/attendance-actions";
import { initialAttendanceActionState } from "../types/attendance-action-state";
import type { OdlAttendancePageData } from "../server/attendance-form-queries";
import { getBrowserLocationWithAddress } from "../utils/browser-location";
import { LocationCapture } from "./location-capture";
import { WebcamCapture } from "./webcam-capture";

type TimeInOutFormProps = {
  pageData: OdlAttendancePageData;
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <p className="mt-1 text-xs font-semibold text-[var(--starland-danger)]">
      {messages[0]}
    </p>
  );
}

function getPunchLabel(punchState: OdlAttendancePageData["punchState"]): string {
  if (punchState === "TIME_IN") {
    return "TIME IN";
  }

  if (punchState === "TIME_OUT") {
    return "TIME OUT";
  }

  if (punchState === "WAITING") {
    return "WAITING";
  }

  if (punchState === "DONE") {
    return "COMPLETED";
  }

  return "BLOCKED";
}

function getReadinessMessage(input: {
  canPunch: boolean;
  hasPhoto: boolean;
  hasLocation: boolean;
  punchState: OdlAttendancePageData["punchState"];
}) {
  if (!input.canPunch) {
    return "Submit is blocked because this account is not currently eligible for ODL web attendance. Camera and GPS can still be tested, but attendance submit remains disabled.";
  }

  if (!input.hasPhoto && !input.hasLocation) {
    return "Required before submit: uniform selfie, automatic GPS coordinates, and full address.";
  }

  if (!input.hasPhoto) {
    return "Required before submit: please capture a uniform selfie.";
  }

  if (!input.hasLocation) {
    return "Required before submit: automatic GPS coordinates and full address.";
  }

  return `Ready to submit ${getPunchLabel(input.punchState)}.`;
}

export function TimeInOutForm({ pageData }: TimeInOutFormProps) {
  const [clientMessage, setClientMessage] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [photoPath, setPhotoPath] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [isLocating, setIsLocating] = useState(true);

  const [state, formAction, isPending] = useActionState(
    recordOdlAttendanceAction,
    initialAttendanceActionState,
  );

  const captureLocationOnLoad = useCallback(async () => {
    setIsLocating(true);
    setLocationMessage("Requesting location permission...");

    try {
      const location = await getBrowserLocationWithAddress();

      setLatitude(location.latitude);
      setLongitude(location.longitude);
      setAddress(location.address);
      setLocationMessage("GPS and full address captured successfully.");
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
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void captureLocationOnLoad();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [captureLocationOnLoad]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setClientMessage("");

    if (!canPunch) {
      event.preventDefault();
      setClientMessage(pageData.message);
      return;
    }

    if (!photoPath) {
      event.preventDefault();
      setClientMessage("Please capture a uniform selfie before submitting.");
      return;
    }

    if (!latitude || !longitude || !address) {
      event.preventDefault();
      setClientMessage(
        "Location and full address are required. Please allow browser location permission and reload the page.",
      );
    }
  }

  const canPunch =
    pageData.punchState === "TIME_IN" || pageData.punchState === "TIME_OUT";

  const hasPhoto = Boolean(photoPath);
  const hasLocation = Boolean(latitude && longitude && address);
  const isSubmitBusy = isPending || isLocating;

  const isReadyToSubmit = Boolean(canPunch && hasPhoto && hasLocation);

  const readinessMessage = getReadinessMessage({
    canPunch,
    hasPhoto,
    hasLocation,
    punchState: pageData.punchState,
  });

  return (
    <section className="starland-card overflow-hidden">
      <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
        <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
          ODL Web Attendance
        </span>

        <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
          ODL Teacher Time-In / Time-Out
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          No employee selection and no punch selection. The system automatically
          decides if your next submit is TIME IN or TIME OUT.
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
                  {pageData.employee.fullName}
                </p>
                <p>{pageData.employee.empNumber}</p>
                <p>{pageData.employee.departmentName}</p>
                <p>{pageData.employee.designationName}</p>
                <p>{pageData.employee.branchName}</p>
                <p>Schedule: {pageData.employee.scheduleName}</p>
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
                Today’s Attendance Status
              </h3>
            </div>

            <span
              className={[
                "starland-badge",
                canPunch ? "starland-badge-success" : "starland-badge-warning",
              ].join(" ")}
            >
              NEXT ACTION: {getPunchLabel(pageData.punchState)}
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
                  {pageData.timeInAt}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                  Time Out
                </p>

                <p className="mt-1 font-bold text-[var(--starland-dark-text)]">
                  {pageData.timeOutAt}
                </p>
              </div>
            </div>

            {pageData.punchState === "WAITING" ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
                Time-out available in {pageData.minutesUntilTimeout} minute(s).
              </div>
            ) : null}
          </div>
        </div>

        <WebcamCapture
          disabled={isPending}
          photoPath={photoPath}
          onPhotoPathChange={setPhotoPath}
          errorMessages={state.fieldErrors?.photoPath}
        />

        {!canPunch ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            Camera is enabled for testing, but attendance submit is blocked for
            this account because it is not detected as an ODL teacher.
          </div>
        ) : null}

        <LocationCapture
          latitude={latitude}
          longitude={longitude}
          address={address}
          isLocating={isLocating}
          locationMessage={locationMessage}
        />

        <FieldError messages={state.fieldErrors?.latitude} />
        <FieldError messages={state.fieldErrors?.longitude} />
        <FieldError messages={state.fieldErrors?.address} />

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
              disabled={isSubmitBusy || !canPunch}
            />

            <FieldError messages={state.fieldErrors?.remarks} />
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
              disabled={isSubmitBusy || !canPunch}
            />

            <FieldError messages={state.fieldErrors?.reason} />
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
          disabled={isSubmitBusy || !isReadyToSubmit}
        >
          {isSubmitBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {isLocating ? "Getting Location..." : "Recording..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Submit {getPunchLabel(pageData.punchState)}
            </>
          )}
        </button>
      </form>
    </section>
  );
}