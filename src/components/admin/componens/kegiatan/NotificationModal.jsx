import React, { useState, useEffect } from "react";
import customAPI from "../../../../api"; // Import custom API
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Filter,
  Search,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  BarChart3,
  TrendingUp,
  Mail,
  Phone,
  FileText,
  Settings,
  UserCheck,
  UserX,
  Star,
  Send,
  Loader2,
  MessageSquare,
  X,
  Smartphone,
  AtSign,
  Volume2,
  Users2,
} from "lucide-react";

// Komponen Modal Kirim Notifikasi
const NotificationModal = ({
  isOpen,
  onClose,
  participants = [],
  eventData = null,
}) => {
  const [notificationType, setNotificationType] = useState("email");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [targetAudience, setTargetAudience] = useState("all"); // all, confirmed, pending
  const [loading, setLoading] = useState(false);
  const [sendResults, setSendResults] = useState(null);

  // Template messages
  const templates = {
    reminder: {
      subject: "Pengingat Kegiatan: {eventTitle}",
      email: `Assalamu'alaikum Wr. Wb.

Kami ingatkan bahwa Anda telah terdaftar dalam kegiatan:

📅 Kegiatan: {eventTitle}
🕐 Waktu: {eventDate} pukul {eventTime}
📍 Lokasi: {eventLocation}

Jangan lupa untuk hadir tepat waktu. Barakallahu fiikum.

Wassalamu'alaikum Wr. Wb.
Panitia {eventTitle}`,
      whatsapp: `🕌 *Pengingat Kegiatan*

Assalamu'alaikum, {participantName}

Kami ingatkan kegiatan berikut:

📅 *{eventTitle}*
🕐 {eventDate} - {eventTime}
📍 {eventLocation}

Mohon hadir tepat waktu. Jazakallahu khairan 🤲

_Panitia {eventTitle}_`,
    },
    confirmation: {
      subject: "Konfirmasi Pendaftaran: {eventTitle}",
      email: `Assalamu'alaikum Wr. Wb.

Terima kasih telah mendaftar dalam kegiatan:

📅 Kegiatan: {eventTitle}
🕐 Waktu: {eventDate} pukul {eventTime}
📍 Lokasi: {eventLocation}
👤 Nama: {participantName}
📱 No HP: {participantPhone}

Status pendaftaran Anda: DIKONFIRMASI ✅

Mohon simpan informasi ini dan hadir tepat waktu.

Wassalamu'alaikum Wr. Wb.`,
      whatsapp: `🕌 *Konfirmasi Pendaftaran*

Assalamu'alaikum, {participantName}

Pendaftaran Anda *DIKONFIRMASI* ✅

📅 *{eventTitle}*
🕐 {eventDate} - {eventTime}
📍 {eventLocation}

Simpan pesan ini sebagai bukti. Sampai jumpa di acara! 🤲`,
    },
    cancellation: {
      subject: "Pemberitahuan Pembatalan: {eventTitle}",
      email: `Assalamu'alaikum Wr. Wb.

Dengan sangat menyesal kami informasikan bahwa kegiatan berikut DIBATALKAN:

📅 Kegiatan: {eventTitle}
🕐 Waktu: {eventDate} pukul {eventTime}
📍 Lokasi: {eventLocation}

Mohon maaf atas ketidaknyamanan ini. Kami akan memberitahu jadwal pengganti jika ada.

Wassalamu'alaikum Wr. Wb.`,
      whatsapp: `🕌 *Pemberitahuan Penting*

Assalamu'alaikum, {participantName}

Mohon maaf, kegiatan berikut *DIBATALKAN*:

📅 *{eventTitle}*
🕐 {eventDate} - {eventTime}

Kami akan informasikan jadwal pengganti. Terima kasih atas pengertiannya 🤲`,
    },
  };

  const [selectedTemplate, setSelectedTemplate] = useState("reminder");

  useEffect(() => {
    if (eventData && selectedTemplate) {
      const template = templates[selectedTemplate];
      setSubject(
        template.subject.replace("{eventTitle}", eventData.title || "")
      );
      setMessage(template[notificationType] || "");
    }
  }, [selectedTemplate, notificationType, eventData]);

  const filteredParticipants = participants.filter((p) => {
    if (targetAudience === "all") return true;
    if (targetAudience === "confirmed") return p.status === "confirmed";
    if (targetAudience === "pending") return p.status === "pending";
    return true;
  });

  const replaceVariables = (text, participant = null, event = eventData) => {
    if (!text) return "";

    let result = text;

    // Event variables
    if (event) {
      result = result.replace(/{eventTitle}/g, event.title || "");
      result = result.replace(/{eventLocation}/g, event.location || "");

      if (event.date) {
        const eventDate = new Date(event.date);
        result = result.replace(
          /{eventDate}/g,
          eventDate.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        );
        result = result.replace(
          /{eventTime}/g,
          eventDate.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      }
    }

    // Participant variables
    if (participant) {
      result = result.replace(/{participantName}/g, participant.name || "");
      result = result.replace(/{participantPhone}/g, participant.phone || "");
    }

    return result;
  };

  const handleSendNotification = async () => {
    if (!message.trim()) {
      alert("Pesan tidak boleh kosong!");
      return;
    }

    if (filteredParticipants.length === 0) {
      alert("Tidak ada peserta yang sesuai dengan kriteria!");
      return;
    }

    setLoading(true);
    setSendResults(null);

    try {
      const notificationData = {
        type: notificationType,
        subject: replaceVariables(subject),
        message: message,
        targetAudience: targetAudience,
        participants: filteredParticipants.map((p) => ({
          id: p._id,
          name: p.name,
          phone: p.phone,
          email: p.email || `${p.phone}@placeholder.com`, // Placeholder email
          personalizedMessage: replaceVariables(message, p, eventData),
          personalizedSubject: replaceVariables(subject, p, eventData),
        })),
      };

      const response = await customAPI.post(
        `/event/${eventData._id}/send-notification`,
        notificationData
      );

      if (response.data.success) {
        setSendResults(response.data.results);
        alert("Notifikasi berhasil dikirim!");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      alert(error.response?.data?.message || "Gagal mengirim notifikasi");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Kirim Notifikasi</h2>
              <p className="text-gray-600">{eventData?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Notification Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Jenis Notifikasi
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setNotificationType("email")}
                className={`p-4 border-2 rounded-xl flex items-center gap-3 transition-colors ${
                  notificationType === "email"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <AtSign className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Email</div>
                  <div className="text-sm text-gray-600">Kirim via email</div>
                </div>
              </button>

              <button
                onClick={() => setNotificationType("whatsapp")}
                className={`p-4 border-2 rounded-xl flex items-center gap-3 transition-colors ${
                  notificationType === "whatsapp"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <MessageSquare className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">WhatsApp</div>
                  <div className="text-sm text-gray-600">Kirim via WA</div>
                </div>
              </button>
            </div>
          </div>

          {/* Template Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Template Pesan
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="reminder">📢 Pengingat Kegiatan</option>
              <option value="confirmation">✅ Konfirmasi Pendaftaran</option>
              <option value="cancellation">❌ Pemberitahuan Pembatalan</option>
            </select>
          </div>

          {/* Target Audience */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Target Penerima ({filteredParticipants.length} orang)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTargetAudience("all")}
                className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                  targetAudience === "all"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <Users2 className="w-4 h-4 mx-auto mb-1" />
                Semua ({participants.length})
              </button>

              <button
                onClick={() => setTargetAudience("confirmed")}
                className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                  targetAudience === "confirmed"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <UserCheck className="w-4 h-4 mx-auto mb-1" />
                Terkonfirmasi (
                {participants.filter((p) => p.status === "confirmed").length})
              </button>

              <button
                onClick={() => setTargetAudience("pending")}
                className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                  targetAudience === "pending"
                    ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <Clock className="w-4 h-4 mx-auto mb-1" />
                Pending (
                {participants.filter((p) => p.status === "pending").length})
              </button>
            </div>
          </div>

          {/* Subject (for email) */}
          {notificationType === "email" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjek Email
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan subjek email..."
              />
            </div>
          )}

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesan
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Tulis pesan ${notificationType} Anda di sini...`}
            />
            <div className="mt-2 text-xs text-gray-500">
              <p>Variabel yang tersedia:</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <span>• {"{eventTitle}"} - Nama kegiatan</span>
                <span>• {"{eventDate}"} - Tanggal kegiatan</span>
                <span>• {"{eventTime}"} - Waktu kegiatan</span>
                <span>• {"{eventLocation}"} - Lokasi kegiatan</span>
                <span>• {"{participantName}"} - Nama peserta</span>
                <span>• {"{participantPhone}"} - No HP peserta</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview Pesan
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              {notificationType === "email" && (
                <div className="mb-2">
                  <strong>Subjek:</strong>{" "}
                  {replaceVariables(subject, filteredParticipants[0])}
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm">
                {replaceVariables(message, filteredParticipants[0])}
              </div>
            </div>
          </div>

          {/* Send Results */}
          {sendResults && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                Hasil Pengiriman:
              </h4>
              <div className="text-sm text-green-700">
                <p>✅ Berhasil: {sendResults.success} pesan</p>
                <p>❌ Gagal: {sendResults.failed} pesan</p>
                {sendResults.errors && sendResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Error:</p>
                    <ul className="list-disc list-inside">
                      {sendResults.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors disabled:opacity-50">
              Batal
            </button>
            <button
              onClick={handleSendNotification}
              disabled={
                loading || !message.trim() || filteredParticipants.length === 0
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <Send className="w-4 h-4" />
              Kirim ke {filteredParticipants.length} Orang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen Broadcast Notifikasi (untuk semua jamaah)
const BroadcastModal = ({ isOpen, onClose }) => {
  const [notificationType, setNotificationType] = useState("whatsapp");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);

  const broadcastTemplates = {
    announcement: {
      subject: "Pengumuman Penting - Masjid Ulil Albab",
      whatsapp: `🕌 *PENGUMUMAN MASJID ULIL ALBAB*

Assalamu'alaikum Warahmatullahi Wabarakatuh

{message}

Terima kasih atas perhatiannya.

Wassalamu'alaikum Wr. Wb.
_Pengurus Masjid Ulil Albab_`,
      email: `Assalamu'alaikum Warahmatullahi Wabarakatuh

{message}

Demikian pengumuman ini kami sampaikan. Terima kasih atas perhatian dan kerjasama Anda.

Wassalamu'alaikum Wr. Wb.

Pengurus Masjid Ulil Albab`,
    },
  };

  const handleBroadcast = async () => {
    if (!message.trim()) {
      alert("Pesan tidak boleh kosong!");
      return;
    }

    setLoading(true);

    try {
      const broadcastData = {
        type: notificationType,
        subject: subject,
        message: message,
      };

      const response = await customAPI.post(
        "/broadcast/notification",
        broadcastData
      );

      if (response.data.success) {
        alert("Broadcast berhasil dikirim!");
        onClose();
      }
    } catch (error) {
      console.error("Error sending broadcast:", error);
      alert(error.response?.data?.message || "Gagal mengirim broadcast");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Volume2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Broadcast Pengumuman</h2>
              <p className="text-gray-600">Kirim pesan ke semua jamaah</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Notification Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Jenis Notifikasi
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setNotificationType("email")}
                className={`p-4 border-2 rounded-xl flex items-center gap-3 transition-colors ${
                  notificationType === "email"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <AtSign className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Email</div>
                  <div className="text-sm text-gray-600">
                    Broadcast via email
                  </div>
                </div>
              </button>

              <button
                onClick={() => setNotificationType("whatsapp")}
                className={`p-4 border-2 rounded-xl flex items-center gap-3 transition-colors ${
                  notificationType === "whatsapp"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <MessageSquare className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">WhatsApp</div>
                  <div className="text-sm text-gray-600">Broadcast via WA</div>
                </div>
              </button>
            </div>
          </div>

          {/* Subject */}
          {notificationType === "email" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjek Email
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Pengumuman Penting - Masjid Ulil Albab"
              />
            </div>
          )}

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesan Pengumuman
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Tulis pengumuman untuk seluruh jamaah..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors disabled:opacity-50">
              Batal
            </button>
            <button
              onClick={handleBroadcast}
              disabled={loading || !message.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <Volume2 className="w-4 h-4" />
              Kirim Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NotificationModal, BroadcastModal };
