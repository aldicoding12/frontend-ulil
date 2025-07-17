/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  MapPin,
  Clock,
  X,
  Phone,
  AlertCircle,
} from "lucide-react";

function ReservasiView() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6)); // July 2025
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: "",
    phone: "",
    email: "",
    eventId: null,
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [userRegistrations, setUserRegistrations] = useState([]);

  // Data kegiatan masjid
  const events = {
    "2025-07-01": [
      {
        id: 1,
        title: "Kajian Taklim",
        type: "taklim",
        time: "08:00 - 10:00",
        startTime: "08:00",
        endTime: "10:00",
        speaker: "Ustadz Ahmad Fauzi",
        location: "Grand Ballroom Al-Akbar",
        description: "Kajian rutin mingguan membahas kitab Riyadhus Shalihin",
        capacity: 200,
        registered: 156,
      },
    ],
    "2025-07-07": [
      {
        id: 2,
        title: "Kajian Ma'rufa",
        type: "kajian",
        time: "16:00 - 17:30",
        startTime: "16:00",
        endTime: "17:30",
        speaker: "Ustadzah Fatimah Az-Zahra",
        location: "Ruang Utama (A)",
        description: "Kajian khusus muslimah tentang fiqih wanita",
        capacity: 150,
        registered: 98,
      },
    ],
    "2025-07-12": [
      {
        id: 3,
        title: "Ngaji & Ngopi Bareng",
        type: "spesial",
        time: "19:30 - 21:00",
        startTime: "19:30",
        endTime: "21:00",
        speaker: "Ustadz Islamia",
        location: "Ruang Utama (A)",
        description:
          "Diskusi santai seputar kehidupan sehari-hari dalam perspektif Islam",
        capacity: 100,
        registered: 87,
      },
    ],
    "2025-07-13": [
      {
        id: 4,
        title: "Tabligh Akbar Izzah",
        type: "tabligh",
        time: "09:00 - 12:00",
        startTime: "09:00",
        endTime: "12:00",
        speaker: "Syaikh Dr. Abdullah bin Basfar",
        location: "Ruang Utama (A)",
        description: 'Tabligh akbar dengan tema "Meraih Keberkahan Hidup"',
        capacity: 500,
        registered: 423,
      },
    ],
    "2025-07-18": [
      {
        id: 5,
        title: "Kajian Sirah Sahabat",
        type: "sirah",
        time: "18:30 - 20:00",
        startTime: "18:30",
        endTime: "20:00",
        speaker: "Ustadz Muhammad Nuzul",
        location: "Ruang Zaitun (E)",
        description: "Mengkaji perjalanan hidup para sahabat Rasulullah SAW",
        capacity: 80,
        registered: 65,
      },
    ],
    "2025-07-20": [
      {
        id: 6,
        title: "Kajian Keluarga",
        type: "keluarga",
        time: "10:00 - 12:00",
        startTime: "10:00",
        endTime: "12:00",
        speaker: "Tim Konselor Masjid",
        location: "Ruang Utama (A)",
        description:
          "Membangun keluarga yang harmonis berdasarkan Al-Quran dan Sunnah",
        capacity: 120,
        registered: 95,
      },
      {
        id: 13,
        title: "Kelas Tahsin MAS",
        type: "quran",
        time: "16:00 - 17:30",
        startTime: "16:00",
        endTime: "17:30",
        speaker: "Ustadz Yusuf",
        location: "Ruang Utama (A)",
        description: "Perbaikan bacaan Al-Quran dengan metode tahsin",
        capacity: 50,
        registered: 42,
      },
    ],
    "2025-07-25": [
      {
        id: 8,
        title: "Kajian Fiqih",
        type: "fiqih",
        time: "19:30 - 21:00",
        startTime: "19:30",
        endTime: "21:00",
        speaker: "Dr. H. Abdul Somad",
        location: "Ruang Utama (A)",
        description: "Pembahasan masalah-masalah fiqih masa kini",
        capacity: 200,
        registered: 167,
      },
    ],
    "2025-07-26": [
      {
        id: 9,
        title: "Sedekah Jumat",
        type: "sosial",
        time: "11:00 - 14:00",
        startTime: "11:00",
        endTime: "14:00",
        speaker: "Panitia Amal",
        location: "Grand Ballroom Al-Akbar",
        description: "Program bulanan berbagi dengan kaum dhuafa",
        capacity: 300,
        registered: 245,
      },
    ],
    "2025-07-31": [
      {
        id: 10,
        title: "Kajian Ramadhan",
        type: "keluarga",
        time: "09:00 - 11:00",
        startTime: "09:00",
        endTime: "11:00",
        speaker: "Ustadzah Dr. Oki Setiana",
        location: "Ruang Utama (A)",
        description: "Persiapan menyambut bulan Ramadhan",
        capacity: 150,
        registered: 134,
      },
    ],
  };

  // Helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction)
    );
  };

  const handleDateClick = (day) => {
    const dateStr = formatDate(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(dateStr);

    // Show registration form if there are events on this date
    if (events[dateStr] && events[dateStr].length > 0) {
      setShowRegistrationForm(true);
      setRegistrationData({ ...registrationData, eventId: null });
      setFormErrors({});
    }
  };

  const checkTimeConflict = (selectedEventId, selectedDate) => {
    const dateEvents = events[selectedDate] || [];
    const selectedEvent = dateEvents.find((e) => e.id === selectedEventId);

    if (!selectedEvent) return null;

    // Check user's existing registrations for the same date
    const userEventsOnDate = userRegistrations.filter((reg) => {
      const regEvent = Object.values(events)
        .flat()
        .find((e) => e.id === reg.eventId);
      return reg.date === selectedDate && regEvent;
    });

    for (const registration of userEventsOnDate) {
      const registeredEvent = Object.values(events)
        .flat()
        .find((e) => e.id === registration.eventId);

      if (registeredEvent && registeredEvent.id !== selectedEventId) {
        // Check if times overlap
        const selectedStart = selectedEvent.startTime;
        const selectedEnd = selectedEvent.endTime;
        const registeredStart = registeredEvent.startTime;
        const registeredEnd = registeredEvent.endTime;

        if (
          (selectedStart >= registeredStart && selectedStart < registeredEnd) ||
          (selectedEnd > registeredStart && selectedEnd <= registeredEnd) ||
          (selectedStart <= registeredStart && selectedEnd >= registeredEnd)
        ) {
          return registeredEvent;
        }
      }
    }

    return null;
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();

    const errors = {};

    // Validate form fields
    if (!registrationData.name.trim()) errors.name = "Nama harus diisi";
    if (!registrationData.phone.trim())
      errors.phone = "Nomor telepon harus diisi";
    if (!registrationData.email.trim()) errors.email = "Email harus diisi";
    if (!registrationData.eventId)
      errors.eventId = "Pilih kegiatan yang ingin diikuti";

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (registrationData.email && !emailRegex.test(registrationData.email)) {
      errors.email = "Format email tidak valid";
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10,15}$/;
    if (
      registrationData.phone &&
      !phoneRegex.test(registrationData.phone.replace(/\D/g, ""))
    ) {
      errors.phone = "Nomor telepon tidak valid (10-15 digit)";
    }

    // Check for time conflicts
    if (registrationData.eventId && selectedDate) {
      const conflictingEvent = checkTimeConflict(
        registrationData.eventId,
        selectedDate
      );
      if (conflictingEvent) {
        errors.eventId = `Bentrok dengan "${conflictingEvent.title}" pada jam ${conflictingEvent.time}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Save registration
    const newRegistration = {
      ...registrationData,
      date: selectedDate,
      registrationTime: new Date().toISOString(),
    };

    setUserRegistrations([...userRegistrations, newRegistration]);

    // Reset form
    setRegistrationData({
      name: "",
      phone: "",
      email: "",
      eventId: null,
      notes: "",
    });
    setShowRegistrationForm(false);
    setFormErrors({});

    // Show success message (in real app, this would be a toast/notification)
    alert("Pendaftaran berhasil! Kami akan menghubungi Anda untuk konfirmasi.");
  };

  const getEventTypeColor = (type) => {
    const colors = {
      taklim: "bg-blue-500",
      kajian: "bg-green-500",
      spesial: "bg-blue-500",
      tabligh: "bg-blue-500",
      sirah: "bg-green-500",
      keluarga: "bg-blue-500",
      quran: "bg-blue-500",
      fiqih: "bg-blue-500",
      sosial: "bg-blue-500",
      pelatihan: "bg-green-500",
    };
    return colors[type] || "bg-blue-500";
  };

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-50 to-green-100">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-400 via-green-400 to-green-500 h-48">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 flex justify-between items-start p-6">
          <img
            src="/logo-masjid.png"
            alt="Logo Masjid"
            className="h-16 w-16 bg-white rounded-lg p-2 shadow-lg"
          />
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>Kontak Kami</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-72">
            <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-700 mb-4">Menu</h3>
              <nav className="space-y-2">
                <button className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg border-2 border-dashed border-blue-300">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Jadwal</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-gray-600 rounded-lg">
                  <Users className="w-5 h-5" />
                  <span>Reservasi</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-gray-600 rounded-lg">
                  <MapPin className="w-5 h-5" />
                  <span>Virtual Tour</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-gray-600 rounded-lg">
                  <Users className="w-5 h-5" />
                  <span>Profil</span>
                </button>
              </nav>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-4">Part Of</h3>
              <div className="space-y-3">
                <img
                  src="/partner-1.png"
                  alt="Partner 1"
                  className="h-12 mx-auto"
                />
                <img
                  src="/partner-2.png"
                  alt="Partner 2"
                  className="h-12 mx-auto"
                />
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Jadwal / Kalender
            </h1>

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-700">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                  Today
                </button>
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Days Header */}
              {days.map((day) => (
                <div
                  key={day}
                  className="text-center font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells */}
              {Array.from(
                { length: getFirstDayOfMonth(currentDate) },
                (_, i) => (
                  <div key={`empty-${i}`} className="h-24"></div>
                )
              )}

              {/* Days */}
              {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
                const day = i + 1;
                const dateStr = formatDate(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  day
                );
                const dayEvents = events[dateStr] || [];
                const hasEvents = dayEvents.length > 0;

                return (
                  <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`min-h-[96px] border rounded p-2 cursor-pointer transition-all ${
                      hasEvents
                        ? "hover:shadow-md bg-gray-50"
                        : "hover:bg-gray-50"
                    }`}>
                    <div className="text-sm font-medium text-gray-700">
                      {day}
                    </div>
                    {dayEvents.map((event, idx) => (
                      <div key={idx} className="mt-1">
                        <div
                          className={`text-xs px-2 py-1 rounded text-white truncate ${getEventTypeColor(
                            event.type
                          )}`}>
                          {event.title}
                        </div>
                        <div className="text-xs text-gray-500 px-2 truncate flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Pendaftaran Kegiatan</h2>
                  <p className="text-green-100 mt-1">
                    {new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      parseInt(selectedDate.split("-")[2])
                    ).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowRegistrationForm(false);
                    setFormErrors({});
                  }}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleRegistrationSubmit} className="p-6 space-y-4">
              {/* Event Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Kegiatan <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(events[selectedDate] || []).map((event) => {
                    const conflictingEvent =
                      registrationData.eventId === event.id
                        ? null
                        : checkTimeConflict(event.id, selectedDate);
                    const isDisabled = conflictingEvent !== null;

                    return (
                      <div
                        key={event.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          registrationData.eventId === event.id
                            ? "border-green-500 bg-green-50"
                            : isDisabled
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                            : "border-gray-300 hover:border-green-400"
                        }`}
                        onClick={() =>
                          !isDisabled &&
                          setRegistrationData({
                            ...registrationData,
                            eventId: event.id,
                          })
                        }>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {event.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {event.time} •
                              <MapPin className="w-4 h-4 inline mx-1" />
                              {event.location}
                            </p>
                            <p className="text-sm text-gray-600">
                              <Users className="w-4 h-4 inline mr-1" />
                              {event.speaker}
                            </p>
                            {isDisabled && conflictingEvent && (
                              <p className="text-xs text-red-600 mt-2 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Bentrok dengan "{conflictingEvent.title}" (
                                {conflictingEvent.time})
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm font-medium text-gray-700">
                              {event.registered}/{event.capacity}
                            </p>
                            <p className="text-xs text-gray-500">peserta</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {formErrors.eventId && (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.eventId}
                  </p>
                )}
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={registrationData.name}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        name: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Masukkan nama lengkap"
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={registrationData.phone}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        phone: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="08123456789"
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={registrationData.email}
                  onChange={(e) =>
                    setRegistrationData({
                      ...registrationData,
                      email: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="nama@email.com"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={registrationData.notes}
                  onChange={(e) =>
                    setRegistrationData({
                      ...registrationData,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  placeholder="Tambahkan catatan jika diperlukan"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegistrationForm(false);
                    setFormErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all">
                  Daftar Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReservasiView;
