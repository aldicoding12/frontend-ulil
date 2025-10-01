/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import customAPI from "../../api";
import KegiatanForm from "../../components/admin/componens/kegiatan/KegiatanForm";

// Import components
import HeroSection from "../../components/admin/componens/kegiatan/HeroSection";
import FilterControls from "../../components/admin/componens/kegiatan/FilterControls";
import CalendarGrid from "../../components/admin/componens/kegiatan/CalendarGrid";
import Sidebar from "../../components/admin/componens/kegiatan/Sidebar";
import EventListView from "../../components/admin/componens/kegiatan/EventListView";
import CalendarLegend from "../../components/admin/componens/kegiatan/CalendarLegend";
import EventDetailModal from "../../components/admin/componens/kegiatan/EventDetailModal";
import RegistrationForm from "../../components/admin/componens/kegiatan/RegistrationForm";

// Import utilities
import { categories } from "../../utils/constants";

function EventCalendar() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("calendar");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Registration form states
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [registrationKegiatan, setRegistrationKegiatan] = useState(null);

  // KegiatanForm states
  const [isKegiatanFormOpen, setIsKegiatanFormOpen] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState(null);

  // Fetch events from API (including donation events)
  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Explicitly request to include donation events
      const response = await customAPI.get("/events?includeDonations=true");

      if (response.data.success) {
        const allEvents = response.data.data || [];

        // Process events to add display properties
        const processedEvents = allEvents.map((event) => ({
          ...event,
          // Add a display type for better UI handling
          displayType: event.isDonationEvent ? "donation" : "regular",
          // Ensure all events have required fields for calendar display
          title: event.title || "Untitled Event",
          date: event.date || new Date(),
          category: event.category || "Lainnya",
          status: event.status || "draft",
        }));

        setEvents(processedEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal memuat data kegiatan";
      alert(`Error: ${errorMessage}`);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load events and favorites on component mount
  useEffect(() => {
    fetchEvents();
    const savedFavorites = localStorage.getItem("eventFavorites");
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
    // Animation trigger
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Filter events based on category and add favorite status
  useEffect(() => {
    let filtered = events.map((event) => ({
      ...event,
      isFavorite: favorites.has(event._id),
    }));

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (event) => event.category === selectedCategory
      );
    }

    setFilteredEvents(filtered);
  }, [events, selectedCategory, favorites]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(null);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateString = date.toDateString();
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === dateString;
    });
  };

  // Get events for selected date or all events for list view// Modifikasi fungsi getDisplayEvents() dalam komponen EventCalendar
  const getDisplayEvents = () => {
    if (viewMode === "list") {
      // Untuk list view, filter out kegiatan donasi
      const eventsForList = filteredEvents.filter((event) => {
        return !event.isDonationEvent; // Sembunyikan kegiatan donasi dari daftar
      });

      return eventsForList.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Untuk calendar view, tampilkan semua kegiatan termasuk donasi
    if (selectedDate) {
      return getEventsForDate(selectedDate); // Ini akan menampilkan semua event termasuk donasi
    }

    return [];
  };

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const eventsForDate = getEventsForDate(date);

    // If no events for this date, directly open KegiatanForm
    if (eventsForDate.length === 0) {
      setEditingKegiatan(null);
      setIsKegiatanFormOpen(true);
    }
  };

  // Event handlers
  const handleToggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    localStorage.setItem("eventFavorites", JSON.stringify([...newFavorites]));
  };

  const handleViewDetail = (event) => {
    setSelectedEvent({
      ...event,
      isFavorite: favorites.has(event._id),
    });
    setIsModalOpen(true);
  };

  const handleRegister = (event) => {
    // Check if this is a donation event
    if (event.isDonationEvent) {
      // For donation events, open donation modal instead
      handleDonateToEvent(event);
      return;
    }

    setRegistrationKegiatan(event);
    setIsRegistrationOpen(true);
  };

  const handleDonateToEvent = (event) => {
    // TODO: Implement donation modal
    alert(`Fitur donasi untuk "${event.title}" akan segera tersedia!`);
    // Nanti akan diganti dengan modal donasi
    // setSelectedDonationEvent(event);
    // setIsDonationModalOpen(true);
  };

  const handleAddEvent = (date) => {
    setEditingKegiatan(null);
    setSelectedDate(date);
    setIsKegiatanFormOpen(true);
    setIsModalOpen(false);
  };

  const handleSubmitRegistration = async (registrationData) => {
    try {
      // Check if trying to register for donation event
      if (registrationKegiatan?.isDonationEvent) {
        alert("Event donasi tidak memiliki sistem pendaftaran peserta.");
        return;
      }

      await customAPI.post(
        `/events/${registrationKegiatan._id}/participants`,
        registrationData
      );

      alert("Pendaftaran berhasil! Anda akan segera menerima konfirmasi.");

      // Refresh events to get updated participant count
      await fetchEvents();

      // Close modals
      setIsRegistrationOpen(false);
      setRegistrationKegiatan(null);
    } catch (error) {
      if (error.response?.status === 400) {
        const message = error.response.data.message;
        if (message.includes("penuh")) {
          alert("Maaf, kegiatan sudah penuh!");
        } else if (message.includes("terdaftar")) {
          alert("Nomor telepon sudah terdaftar untuk kegiatan ini!");
        } else if (message.includes("donasi")) {
          alert("Event donasi tidak memiliki sistem pendaftaran peserta!");
        } else {
          alert(message || "Pendaftaran gagal!");
        }
      } else {
        alert("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
      }
    }
  };

  const handleKegiatanFormSave = async () => {
    await fetchEvents();
    setIsKegiatanFormOpen(false);
    setEditingKegiatan(null);
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">
            Memuat kalender kegiatan...
          </p>
        </div>
      </div>
    );
  }

  const displayEvents = getDisplayEvents();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50">
      {/* Hero Section */}
      <HeroSection
        viewMode={viewMode}
        setViewMode={setViewMode}
        isVisible={isVisible}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter Controls */}
        <FilterControls
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          viewMode={viewMode}
          currentDate={currentDate}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
        />

        {/* Calendar/List View */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div
            className={
              viewMode === "calendar" ? "lg:col-span-3" : "lg:col-span-4"
            }>
            {viewMode === "calendar" ? (
              <CalendarGrid
                currentDate={currentDate}
                selectedDate={selectedDate}
                filteredEvents={filteredEvents}
                onDateClick={handleDateClick}
                onViewDetail={handleViewDetail}
              />
            ) : (
              <EventListView
                displayEvents={displayEvents}
                isVisible={isVisible}
                onViewDetail={handleViewDetail}
                onRegister={handleRegister}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </div>

          {/* Sidebar (only for calendar view) */}
          {viewMode === "calendar" && (
            <div className="lg:col-span-1">
              <Sidebar
                selectedDate={selectedDate}
                displayEvents={displayEvents}
                favorites={favorites}
                filteredEvents={filteredEvents}
                currentDate={currentDate}
                onViewDetail={handleViewDetail}
                onRegister={handleRegister}
                onToggleFavorite={handleToggleFavorite}
                onAddEvent={handleAddEvent}
              />
            </div>
          )}
        </div>

        {/* Calendar Legend */}
        <CalendarLegend viewMode={viewMode} />
      </div>

      {/* Modals */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegister={handleRegister}
        onToggleFavorite={handleToggleFavorite}
        onAddEvent={handleAddEvent}
        selectedDate={selectedDate}
      />

      <RegistrationForm
        kegiatan={registrationKegiatan}
        isOpen={isRegistrationOpen}
        onClose={() => {
          setIsRegistrationOpen(false);
          setRegistrationKegiatan(null);
        }}
        onSubmit={handleSubmitRegistration}
      />

      <KegiatanForm
        kegiatan={editingKegiatan}
        isOpen={isKegiatanFormOpen}
        onClose={() => {
          setIsKegiatanFormOpen(false);
          setEditingKegiatan(null);
        }}
        onSave={handleKegiatanFormSave}
        selectedDate={selectedDate}
      />

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="btn btn-circle btn-success fixed bottom-8 right-8 shadow-2xl z-50">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>

      {/* Custom CSS untuk line-clamp */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default EventCalendar;
