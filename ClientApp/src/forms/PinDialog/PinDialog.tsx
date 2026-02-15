import React, { useCallback, useRef, useState } from "react";
import { Button } from "components/Button";
import * as Modal from "components/Modal";
import * as PinStyled from "./PinDialog.styles";
import { PIN_REDIRECT_URL, PIN_LENGTH, PIN_REGEX } from "consts";

interface PinDialogProps {
  onValidate: (pin: string) => Promise<void>;
}

export const PinDialog = ({ onValidate }: PinDialogProps) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (raw.length > 1) {
      const pasted = raw.replace(/[^A-Za-z0-9]/g, "").slice(0, PIN_LENGTH);
      setPin(pasted);
      setError("");
      const next = Math.min(pasted.length, PIN_LENGTH - 1);
      focusInput(next);
      return;
    }

    if (raw !== "" && !PIN_REGEX.test(raw)) return;

    const nextPin = pin.slice(0, index) + raw + pin.slice(index + 1);
    setPin(nextPin.slice(0, PIN_LENGTH));
    setError("");

    if (raw && index < PIN_LENGTH - 1)
      focusInput(index + 1);
  }, [pin, focusInput]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      e.preventDefault();
      setPin((p) => p.slice(0, index - 1) + p.slice(index));
      focusInput(index - 1);
    }
  }, [pin, focusInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length !== PIN_LENGTH) {
      setError(`Enter ${PIN_LENGTH} alphanumeric characters.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onValidate(pin);
    }
    catch {
      window.location.href = PIN_REDIRECT_URL;
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <Modal.Overlay>
      <Modal.Modal style={{ maxWidth: `${60 * PIN_LENGTH + 40}px`, height: "auto" }} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <Modal.ModalHeader>Enter PIN</Modal.ModalHeader>
          <Modal.ModalBody>
            <PinStyled.PinInputRow>
              {Array.from({ length: PIN_LENGTH }, (_, i) => i).map((i) => (
                <PinStyled.PinInput
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  autoFocus={i === 0}
                  value={pin[i] ?? ""}
                  onChange={(e) => handleChange(i, e)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  maxLength={PIN_LENGTH}
                  aria-label={`PIN digit ${i + 1}`}
                />
              ))}
            </PinStyled.PinInputRow>
            {error && (
              <span style={{ color: "#dc2626", fontSize: "0.9rem", marginTop: "0.5rem", display: "block" }}>
                {error}
              </span>
            )}
          </Modal.ModalBody>
          <Modal.ModalFooter>
            <Button $primary type="submit" disabled={loading || pin.length !== PIN_LENGTH}>
              {loading ? "Checking…" : "Continue"}
            </Button>
          </Modal.ModalFooter>
        </form>
      </Modal.Modal>
    </Modal.Overlay>
  );
};
