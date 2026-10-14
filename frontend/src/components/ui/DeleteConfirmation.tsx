"use client";

import { useState, type FormEvent } from "react";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";

type DeleteConfirmationProps = {
  onClose: () => void;
  onDelete: () => void;
};

export default function DeleteConfirmation({ onClose, onDelete }: DeleteConfirmationProps) {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Prototype-only confirmation; replace with server-side authorization when connected to Odoo.
    if (password !== "5950") {
      setError("Incorrect password. Please try again.");
      return;
    }

    try {
      onDelete();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The record could not be deleted.");
    }
  }

  return (
    <Modal
      description="This action cannot be undone."
      onClose={onClose}
      title="Delete this record?"
    >
      <form className="delete-confirmation-form" onSubmit={submit}>
        <label className="form-field">
          <span>Enter password to confirm</span>
          <span className="delete-password-field">
            <input
              autoFocus
              autoComplete="current-password"
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              required
              type={visible ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={visible ? "Hide password" : "Show password"}
              className="delete-password-toggle"
              onClick={() => setVisible((current) => !current)}
              type="button"
            >
              <Icon name={visible ? "eyeOff" : "eye"} size={17} />
            </button>
          </span>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button className="button-secondary" onClick={onClose} type="button">Cancel</button>
          <button className="button-danger" type="submit">
            <Icon name="trash" size={15} />
            Delete record
          </button>
        </div>
      </form>
    </Modal>
  );
}
