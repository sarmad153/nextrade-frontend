import React from "react";

const UserActionsModal = ({
  actionUser,
  setActionUser,
  actionType,
  reason,
  setReason,
  blockUser,
  unblockUser,
  deleteUser,
  changeUserRole,
  resetPassword,
}) => {
  if (!actionUser) return null;

  const handleConfirm = async () => {
    try {
      if (actionType === "block") await blockUser(actionUser.id, reason);
      if (actionType === "unblock") await unblockUser(actionUser.id);
      if (actionType === "delete") await deleteUser(actionUser.id);
      if (actionType === "role") await changeUserRole(actionUser.id, reason);
      if (actionType === "reset_password") await resetPassword(actionUser.id);

      setActionUser(null);
      setReason("");
    } catch (error) {
      console.log("user Action Error!");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#000000c7]">
      <div className="w-full max-w-md mx-4 bg-white border shadow-2xl rounded-xl border-neutral-300 z-[201]">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral-800">
            {actionType === "block"
              ? "Block User"
              : actionType === "unblock"
              ? "Unblock User"
              : actionType === "delete"
              ? "Delete User"
              : actionType === "role"
              ? "Change User Role"
              : "Reset Password"}
          </h3>

          {actionType === "block" && (
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-neutral-700">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter reason for blocking..."
                rows="3"
              />
            </div>
          )}

          {actionType === "role" && (
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-neutral-700">
                New Role
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Role</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 z-[202]">
            <button
              onClick={() => {
                setActionUser(null);
                setReason("");
              }}
              className="px-4 py-2 text-sm font-medium border rounded-lg text-neutral-700 bg-background-subtle border-neutral-300 hover:bg-neutral-200 z-[203]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg z-[203] ${
                actionType === "delete" || actionType === "block"
                  ? "bg-red-600 hover:bg-red-700"
                  : actionType === "role" || actionType === "reset_password"
                  ? "bg-primary-600 hover:bg-primary-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActionsModal;
