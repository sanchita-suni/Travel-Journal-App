import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function TripCalendar() {
  const [events, setEvents] = useState(() => {
    return JSON.parse(localStorage.getItem("trips") || "[]");
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
    notes: "",
  });

  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  useEffect(() => {
    localStorage.setItem("trips", JSON.stringify(events));
  }, [events]);

  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({ title: "", start, end, notes: "" });
    setShowModal(true);
  };

  const handleAddEvent = () => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    setEvents([...events, { ...newEvent, color }]);
    setShowModal(false);
  };

  const eventPropGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      borderRadius: "8px",
      color: "#fff",
      border: "none",
      padding: "4px",
      zIndex: 1,
    },
  });

  return (
    <div
      className="min-h-screen text-white p-6"
      style={{
        background: "linear-gradient(to bottom, #0f172a, #1e293b)",
      }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">
        🗓️ Trip Planner Calendar
      </h1>

      <div
        className="rounded-lg shadow-xl p-4"
        style={{
          backgroundColor: "#111827",
        }}
      >
        <Calendar
          selectable
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventPropGetter}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={(event) => setSelectedEvent(event)}
          views={["month", "week", "day"]}
        />
      </div>

      {/* MODAL — with higher z-index fix */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white text-black rounded-xl p-6 w-[400px] shadow-2xl relative">
            <h2 className="text-xl font-bold mb-4">Add New Trip</h2>
            <input
              type="text"
              placeholder="Trip Title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded-md"
            />
            <textarea
              placeholder="Notes (optional)"
              value={newEvent.notes}
              onChange={(e) =>
                setNewEvent({ ...newEvent, notes: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded-md min-h-[80px]"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleAddEvent}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Trip
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Details */}
      {selectedEvent && (
        <div className="fixed bottom-5 right-5 bg-gray-900 border border-gray-600 p-4 rounded-xl shadow-lg z-[5000]">
          <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
          <p className="text-gray-300">
            {moment(selectedEvent.start).format("MMM DD")} →{" "}
            {moment(selectedEvent.end).format("MMM DD")}
          </p>
          <p className="text-gray-400 mt-2">{selectedEvent.notes}</p>
          <button
            onClick={() => setSelectedEvent(null)}
            className="mt-2 bg-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-700"
          >
            Close
          </button>
        </div>
      )}

      <style>{`
        .rbc-month-view {
          background-color: #1e293b !important;
          color: white !important;
        }
        .rbc-header {
          background: #0f172a !important;
          color: #60a5fa !important;
          padding: 8px !important;
          font-weight: 600;
        }
        .rbc-date-cell {
          color: #e2e8f0 !important;
        }
        .rbc-date-cell.rbc-off-range {
          color: #475569 !important;
        }
        .rbc-today {
          background: rgba(59, 130, 246, 0.2) !important;
        }
        .rbc-event {
          border-radius: 6px !important;
          padding: 4px 6px !important;
          z-index: 1 !important;
        }
      `}</style>
    </div>
  );
}
