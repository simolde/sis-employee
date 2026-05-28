"use client";

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
  return (
    <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <div>
        <p className="text-sm font-extrabold text-[var(--starland-dark-text)]">
          Attachment
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--starland-muted-text)]">
          Choose a file only. The file will be uploaded only after the leave
          request is submitted successfully. Allowed: PDF, JPG, PNG, WEBP.
        </p>
      </div>

      <div className="mt-4">
        <label
          htmlFor="attachment"
          className="text-sm font-bold text-[var(--starland-dark-text)]"
        >
          Choose File
        </label>
        <input
          id="attachment"
          name="attachment"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="starland-input mt-2"
          disabled={disabled}
        />
      </div>

      <FieldError messages={errorMessages} />
    </div>
  );
}