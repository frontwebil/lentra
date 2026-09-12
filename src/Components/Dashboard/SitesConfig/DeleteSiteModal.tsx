"use client";

import { RxCross2, RxTrash } from "react-icons/rx";

type DeleteSiteModalProps = {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: () => void;
  websiteName: string;
  language: string | undefined;
  loading: boolean;
};

export function DeleteSiteModal({
  setIsModalOpen,
  onConfirm,
  websiteName,
  language,
  loading,
}: DeleteSiteModalProps) {
  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <button
          className="delete-modal-close"
          onClick={() => setIsModalOpen(false)}
          disabled={loading}
        >
          <RxCross2 />
        </button>

        <div className="delete-modal-icon">
          <RxTrash />
        </div>

        <h2 className="delete-modal-title">
          {language === "en" ? "Delete website?" : "Видалити сайт?"}
        </h2>

        <p className="delete-modal-description">
          {language === "en"
            ? `Are you sure you want to delete "${websiteName}"? This action cannot be undone.`
            : `Ви впевнені, що хочете видалити "${websiteName}"? Цю дію неможливо скасувати.`}
        </p>

        <div className="delete-modal-actions">
          <button
            className="delete-modal-cancel"
            onClick={() => setIsModalOpen(false)}
            disabled={loading}
          >
            {language === "en" ? "Cancel" : "Скасувати"}
          </button>

          <button
            className="delete-modal-confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            <RxTrash />

            {loading
              ? language === "en"
                ? "Deleting..."
                : "Видалення..."
              : language === "en"
                ? "Delete"
                : "Видалити"}
          </button>
        </div>
      </div>
    </div>
  );
}
