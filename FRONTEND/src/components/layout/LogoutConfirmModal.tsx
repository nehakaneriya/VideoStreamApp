import { LogOut, X } from "lucide-react";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmModal({ onConfirm, onCancel }: Props) {
  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onCancel}
    >
      {/* Modal box */}
      <div
        className="bg-[#181818] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-600/40 flex items-center justify-center">
            <LogOut size={28} className="text-red-500" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Logout?
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          Are you sure you want to logout from your account?
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition font-semibold text-white cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
