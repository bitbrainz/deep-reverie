import React from "react";

interface CustomDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<CustomDialogProps> = ({
  open,
  onClose,
  title,
  children,
}) => {
  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <div style={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose} style={styles.closeButton}>
            X
          </button>
        </div>
        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed" as "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    top: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  dialog: {
    backgroundColor: "white",
    width: "100%",
    height: "50%",
    maxHeight: "50%",
    position: "relative" as "relative",
    display: "flex",
    flexDirection: "column" as "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    borderBottom: "1px solid #ccc",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  content: {
    padding: "1rem",
    overflowY: "auto" as "auto",
  },
};

export default CustomDialog;
