"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
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
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitReadyRef = useRef(false);

  const [clientMessage, setClientMessage] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [isLocating, startLocationTransition] = useTransition();

  const [state, formAction, isPending] = useActionState(
    recordManualAttendanceAction,
    initialAttendanceActionState,
  );

  async function captureLocation() {
    setClientMessage("");

    const location = await getBrowserLocationWithAddress();

    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setAddress(location.address);

    return location;
  }

  function handleRefreshLocation() {
    startLocationTransition(async () => {
      try {
        await captureLocation();
        setClientMessage("GPS and full address captured successfully.");
      } catch (error) {
        setClientMessage(
          error instanceof Error
            ? error.message
            : "Unable to capture GPS and full address.",
        );
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (submitReadyRef.current) {
      submitReadyRef.current = false;
      return;
    }

    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const photoPath = String(formData.get("photoPath") ?? "");

    if (!photoPath) {
      setClientMessage(
        "Please open the camera and capture a uniform selfie before submitting.",
      );
      return;
    }

    startLocationTransition(async () => {
      try {
        const location = await captureLocation();

        setClientMessage(
          `Location captured: ${location.address}. Submitting attendance...`,
        );

        submitReadyRef.current = true;

        window.setTimeout(() => {
          formRef.current?.requestSubmit();
        }, 0);
      } catch (error) {
        setClientMessage(
          error instanceof Error
            ? error.message
            : "Unable to capture GPS and full address.",
        );
      }
    });
  }

  const isBusy = isPending || isLocating;

  return (
    <section className="starland-card overflow-hidden">
      <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
        <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
          Manual Web Punch
        </span>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
          Time-In / Time-Out
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Capture a uniform selfie first. When you click submit, the system will
          automatically get GPS, convert it to a full address, and save the
          punch.
        </p>
      </div>

      <form
        ref={formRef}
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

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label
              htmlFor="empId"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Employee
            </label>
            <select
              id="empId"
              name="empId"
              className="starland-input mt-2"
              defaultValue=""
              disabled={isBusy}
            >
              <option value="">Select employee</option>
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
          errorMessages={state.fieldErrors?.photoPath}
        />

        <LocationCapture
          latitude={latitude}
          longitude={longitude}
          address={address}
          disabled={isBusy}
          isLocating={isLocating}
          onRefresh={handleRefreshLocation}
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
              placeholder="Reason for manual/web punch"
              disabled={isBusy}
            />
            <FieldError messages={state.fieldErrors?.reason} />
          </div>
        </div>

        <button
          type="submit"
          className="starland-btn starland-btn-primary w-full"
          disabled={isBusy}
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {isLocating ? "Getting GPS and Address..." : "Recording..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Submit Attendance
            </>
          )}
        </button>
      </form>
    </section>
  );
}