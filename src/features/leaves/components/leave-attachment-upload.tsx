"use client";

import { useRef, useState } from "react";
import { Loader2, Paperclip, RefreshCcw, Upload } from "lucide-react";
import type { LeaveAttachmentUploadResponse } from "../types/leave-upload-types";

type LeaveAttachmentUploadProps = {
  disabled: boolean;
  errorMessages?: string[];
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <p className="mt-2 text-xs font-semibold text-[var(--starland-danger)]">
      {messages[0]}
    </p>
  );
}

export function LeaveAttachmentUpload({
  disabled,
  errorMessages,
}: LeaveAttachmentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachmentPath, setAttachmentPath] = useState("");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setMessage("Please choose an attachment first.");
      return;
    }

    setIsUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads/leave-attachment", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as LeaveAttachmentUploadResponse;

      if (!response.ok || !result.ok || !result.path) {
        setAttachmentPath("");
        setMessage(result.message || "Failed to upload attachment.");
        return;
      }

      setAttachmentPath(result.path);
      setMessage("Attachment uploaded successfully.");
    } catch {
      setAttachmentPath("");
      setMessage("Unable to upload attachment.");
    } finally {
      setIsUploading(false);
    }
  }

  function clearAttachment() {
    setAttachmentPath("");
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const isDisabled = disabled || isUploading;

  return (
    <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <input type="hidden" name="attachment" value={attachmentPath} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-[var(--starland-dark-text)]">
            Attachment
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--starland-muted-text)]">
            Optional upload for supporting documents. Allowed: PDF, JPG, PNG,
            WEBP.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="starland-btn starland-btn-primary starland-btn-sm"
            onClick={handleUpload}
            disabled={isDisabled}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" aria-hidden="true" />
                Upload
              </>
            )}
          </button>

          <button
            type="button"
            className="starland-btn starland-btn-secondary starland-btn-sm"
            onClick={clearAttachment}
            disabled={isDisabled || !attachmentPath}
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Clear
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="leaveAttachmentFile"
          className="text-sm font-bold text-[var(--starland-dark-text)]"
        >
          Choose File
        </label>
        <input
          ref={fileInputRef}
          id="leaveAttachmentFile"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="starland-input mt-2"
          disabled={isDisabled}
        />
      </div>

      {attachmentPath ? (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            Saved path: {attachmentPath}
          </div>
        </div>
      ) : null}

      <FieldError messages={errorMessages} />

      {message ? (
        <div className="mt-4 rounded-2xl border border-[var(--starland-border)] bg-white p-3 text-sm font-semibold text-[var(--starland-dark-text)]">
          {message}
        </div>
      ) : null}
    </div>
  );
}