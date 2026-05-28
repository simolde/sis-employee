"use client";

import type {
  ButtonHTMLAttributes,
  MouseEvent,
  ReactNode,
} from "react";

type ConfirmSubmitButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "onClick"
> & {
  type?: "button" | "submit" | "reset";
  confirmMessage: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function ConfirmSubmitButton({
  type = "submit",
  confirmMessage,
  children,
  onClick,
  ...props
}: ConfirmSubmitButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  }

  return (
    <button type={type} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}