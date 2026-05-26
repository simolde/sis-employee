"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { recordManualAttendanceAction } from "../server/attendance-actions";
import { initialAttendanceActionState } from "../types/attendance-action-state";
import type { AttendanceFormOptions } from "../server/attendance-form-queries";
import { getBrowserLocationWithAddress } from "../utils/browser-location";
import { LocationCapture } from "./location-capture";
import { WebcamCapture } from "./webcam-capture";

type TimeInOutFormProps = {
  options: AttendanceFormOptions;
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

export function TimeInOutForm({ options }: TimeInOutFormProps) {
  const [clientMessage, setClientMessage] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [photoPath, setPhotoPath] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [isLocating, setIsLocating] = useState(true);

  const [state, formAction, isPending] = useActionState(
    recordManualAttendanceAction,
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

  const isBusy = isPending || isLocating;
  const isReadyToSubmit = Boolean(photoPath && latitude && longitude && address);

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
          This page is only for Online Distance Learning teachers. Face-to-face
          teachers must use the lobby RFID/biometric attendance system.
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

        {options.employees.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
            No ODL teachers were found. Make sure the employee record has ODL or
            Online Distance Learning in Department/Employee Type and Teacher,
            Faculty, or Instructor in Designation/Employee Type.
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label
              htmlFor="empId"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              ODL Teacher
            </label>
            <select
              id="empId"
              name="empId"
              className="starland-input mt-2"
              defaultValue=""
              disabled={isBusy}
            >
              <option value="">Select ODL teacher</option>
              {options.employees.map((employee) => (
                <option key={employee.empId} value={employee.empId}>
                  {employee.empNumber} · {employee.fullName}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.empId} />
          </div>

          <div>
            <label
              htmlFor="branchId"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Branch
            </label>
            <select
              id="branchId"
              name="branchId"
              className="starland-input mt-2"
              defaultValue=""
              disabled={isBusy}
            >
              <option value="">Select branch</option>
              {options.branches.map((branch) => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.name}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.branchId} />
          </div>

          <div>
            <label
              htmlFor="punchType"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Punch Type
            </label>
            <select
              id="punchType"
              name="punchType"
              className="starland-input mt-2"
              defaultValue="TIME_IN"
              disabled={isBusy}
            >
              <option value="TIME_IN">Time In</option>
              <option value="TIME_OUT">Time Out</option>
            </select>
            <FieldError messages={state.fieldErrors?.punchType} />
          </div>
        </div>

        <WebcamCapture
          disabled={isBusy}
          photoPath={photoPath}
          onPhotoPathChange={setPhotoPath}
          errorMessages={state.fieldErrors?.photoPath}
        />

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
              disabled={isBusy}
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
              placeholder="Reason for ODL web punch"
              disabled={isBusy}
            />
            <FieldError messages={state.fieldErrors?.reason} />
          </div>
        </div>

        {!isReadyToSubmit ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
            Required before submit: uniform selfie and automatic location/full
            address.
          </div>
        ) : (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            Ready to submit. Selfie and location are complete.
          </div>
        )}

        <button
          type="submit"
          className="starland-btn starland-btn-primary w-full"
          disabled={isBusy || !isReadyToSubmit || options.employees.length === 0}
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {isLocating ? "Getting Location..." : "Recording..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Submit ODL Attendance
            </>
          )}
        </button>
      </form>
    </section>
  );
}