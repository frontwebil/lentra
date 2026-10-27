import { useState } from "react";
import { RxCross2, RxTrash } from "react-icons/rx";

type Props = {
  language: "uk" | "en" | undefined;
  setIsOpenDeleteModal: (isOpen: boolean) => void;
  leadId: string;
};

export function DeleteLeadModal({
  language,
  setIsOpenDeleteModal,
  leadId,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
  };
  return (
    <div className="dashboard-modal-overlay delete-modal-overlay">
      {loading && (
        <div className="widget-loader">
          <div className="loader" style={{ borderTopColor: "#000" }} />
        </div>
      )}
      <div className="delete-modal">
        <button
          className="dashboard-icon-button delete-modal-close"
          onClick={() => setIsOpenDeleteModal(false)}
        >
          <RxCross2 />
        </button>

        <div className="delete-modal-icon">
          <RxTrash />
        </div>

        <h2 className="dashboard-semibold delete-modal-title">
          {language === "en" ? "Delete lead?" : "Видалити ліда?"}
        </h2>

        <p className="delete-modal-description">
          {language === "en"
            ? `Are you sure you want to delete this lead? This action cannot be undone.`
            : `Ви впевнені, що хочете видалити цього ліда? Цю дію неможливо скасувати.`}
        </p>

        <div className="delete-modal-actions">
          <button
            className="delete-modal-cancel"
            onClick={() => setIsOpenDeleteModal(false)}
          >
            {language === "en" ? "Cancel" : "Скасувати"}
          </button>

          <button
            className="delete-modal-confirm"
            onClick={() => handleDelete()}
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
