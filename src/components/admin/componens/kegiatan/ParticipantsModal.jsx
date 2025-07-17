import React from "react";
import {
  Calendar,
  Phone,
  Users,
  UserCheck,
  UserX,
  Download,
  Send,
} from "lucide-react";

const ParticipantsModal = ({ kegiatan, isOpen, onClose, onUpdateStatus }) => {
  if (!isOpen || !kegiatan) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Dikonfirmasi";
      case "pending":
        return "Menunggu";
      case "cancelled":
        return "Dibatalkan";
      default:
        return "Tidak Diketahui";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Daftar Peserta</h2>
            <p className="text-gray-600">{kegiatan.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {kegiatan.registeredCount}
              </p>
              <p className="text-blue-600 text-sm">Total Pendaftar</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {kegiatan.participants?.filter((p) => p.status === "confirmed")
                  .length || 0}
              </p>
              <p className="text-green-600 text-sm">Dikonfirmasi</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {kegiatan.participants?.filter((p) => p.status === "pending")
                  .length || 0}
              </p>
              <p className="text-yellow-600 text-sm">Menunggu</p>
            </div>
          </div>

          {kegiatan.participants && kegiatan.participants.length > 0 ? (
            <div className="space-y-4">
              {kegiatan.participants.map((participant) => (
                <div
                  key={participant._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{participant.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {participant.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(participant.registeredAt).toLocaleDateString(
                          "id-ID"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        participant.status
                      )}`}>
                      {getStatusText(participant.status)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          onUpdateStatus(participant._id, "confirmed")
                        }
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Konfirmasi">
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          onUpdateStatus(participant._id, "cancelled")
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Batalkan">
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Belum ada peserta yang mendaftar</p>
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              onClick={() => {
                /* Handle export */
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button
              onClick={() => {
                /* Handle send notification */
              }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Send className="w-4 h-4" />
              Kirim Notifikasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsModal;
