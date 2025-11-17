import React, { useState, useEffect, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";

const localizer = momentLocalizer(moment);

// Reminder options
const reminderTimeline = [
  { label: "Start", value: "start" },
  { label: "10m", value: "10m" },
  { label: "1h", value: "1h" },
  { label: "1d", value: "1d" },
  { label: "Custom", value: "custom" },
];

export default function TripPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");

  // ===================== LOAD EVENTS =====================
  const [events, setEvents] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("trips") || "[]");
      return raw.map((e) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
        customReminder: e.customReminder ? new Date(e.customReminder) : null,
      }));
    } catch {
      return [];
    }
  });

  const [selectedEvent, setSelectedEvent] = useState(null);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
    notes: "",
    reminder: null,
    customReminder: null,
  });

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // ===================== REMINDER LOGIC =====================

  function computeReminderTime(e) {
    if (!e.reminder) return null;
    const start = new Date(e.start);

    switch (e.reminder) {
      case "start":
        return start;
      case "10m":
        return new Date(start.getTime() - 10 * 60 * 1000);
      case "1h":
        return new Date(start.getTime() - 60 * 60 * 1000);
      case "1d":
        return new Date(start.getTime() - 24 * 60 * 60 * 1000);
      case "custom":
        return e.customReminder ? new Date(e.customReminder) : null;
      default:
        return null;
    }
  }

  function showNotification(event) {
    new Notification("Trip Reminder ✈️", {
      body: `${event.title} starts soon!`,
      icon: "/vite.svg",
    });
  }

  function scheduleReminder(event) {
    const reminderTime = computeReminderTime(event);
    if (!reminderTime) return;

    const diff = reminderTime - new Date();
    if (diff <= 0) return;

    setTimeout(() => {
      if (Notification.permission === "granted") {
        showNotification(event);
      }
    }, diff);
  }

  useEffect(() => {
    Notification.requestPermission();
    events.forEach(scheduleReminder);
  }, [events]);

  // ===================== SAVE TO LOCAL STORAGE =====================
  useEffect(() => {
    localStorage.setItem(
      "trips",
      JSON.stringify(
        events.map((e) => ({
          ...e,
          start: e.start.toISOString(),
          end: e.end.toISOString(),
          customReminder: e.customReminder
            ? e.customReminder.toISOString()
            : null,
        }))
      )
    );
  }, [events]);

  // ===================== NAVIGATION =====================
  const goPrev = () => {
    const d = moment(currentDate);
    setCurrentDate(
      currentView === "month"
        ? d.subtract(1, "month").toDate()
        : d.subtract(1, "week").toDate()
    );
  };

  const goNext = () => {
    const d = moment(currentDate);
    setCurrentDate(
      currentView === "month"
        ? d.add(1, "month").toDate()
        : d.add(1, "week").toDate()
    );
  };

  // ===================== EVENT STYLING =====================
  const eventPropGetter = (event) => ({
    style: {
      backgroundColor: "#3b82f6",
      borderRadius: "6px",
      color: "white",
      padding: "4px",
    },
  });

  const label = moment(currentDate).format("MMMM YYYY");

  // ===================== ADD EVENT =====================
  function saveNewEvent() {
    const id = Date.now() + Math.random();
    setEvents([...events, { ...newEvent, id }]);
    setShowAdd(false);
  }

  // ===================== DELETE EVENT =====================
  function deleteEvent(id) {
    setEvents(events.filter((e) => e.id !== id));
    setSelectedEvent(null);
    setShowEdit(false);
  }

  // ===================== EDIT EVENT =====================
  function saveEditedEvent() {
    setEvents(
      events.map((e) => (e.id === editingEvent.id ? editingEvent : e))
    );
    setShowEdit(false);
  }

  // ===================== TIMELINE UI COMPONENT =====================
  const ReminderTimeline = ({ value, onChange }) => {
    return (
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "8px",
          borderRadius: "10px",
          background: "#1f2937",
        }}
      >
        {reminderTimeline.map((opt) => (
          <div
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              background:
                value === opt.value ? "#3b82f6" : "rgba(255,255,255,0.1)",
              color: "white",
              fontWeight: value === opt.value ? "700" : "400",
              flexGrow: 1,
              textAlign: "center",
            }}
          >
            {opt.label}
          </div>
        ))}
      </div>
    );
  };

  // ===================== UI =====================
  return (
    <div
      className="p-6 min-h-screen text-white"
      style={{ background: "linear-gradient(#0f172a, #1e293b)" }}
    >
      <h1 className="text-3xl font-bold text-center mb-6">
        🗓️ Trip Planner Calendar
      </h1>

      {/* Toolbar */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto 20px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <button className="bg-gray-700 px-3 py-1 rounded" onClick={goPrev}>
            ‹
          </button>
          <button className="bg-gray-700 px-3 py-1 rounded" onClick={goNext}>
            ›
          </button>
        </div>

        <div className="text-xl font-bold">{label}</div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="bg-gray-700 px-3 py-1 rounded"
            onClick={() => setCurrentView("month")}
          >
            Month
          </button>
          <button
            className="bg-gray-700 px-3 py-1 rounded"
            onClick={() => setCurrentView("week")}
          >
            Week
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div
        style={{
          maxWidth: 1100,
          margin: "auto",
          background: "#0b1220",
          padding: 12,
          borderRadius: 10,
        }}
      >
        <Calendar
          localizer={localizer}
          date={currentDate}
          view={currentView}
          events={events}
          onNavigate={(d) => setCurrentDate(d)}
          onView={(v) => setCurrentView(v)}
          selectable
          onSelectSlot={(slotInfo) => {
            setNewEvent({
              title: "",
              start: slotInfo.start,
              end: slotInfo.end,
              notes: "",
              reminder: null,
              customReminder: null,
            });
            setShowAdd(true);
          }}
          onSelectEvent={(e) => setSelectedEvent(e)}
          eventPropGetter={eventPropGetter}
          style={{ height: 650 }}
        />
      </div>

      {/* ADD EVENT MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-[450px]">
            <h2 className="text-xl font-bold mb-3">Add Trip</h2>

            <input
              className="w-full p-2 border rounded mb-3"
              placeholder="Trip Title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
            />

            <label className="font-semibold text-sm">Start</label>
            <DatePicker
              selected={newEvent.start}
              onChange={(d) => setNewEvent({ ...newEvent, start: d })}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full p-2 border rounded mb-3"
            />

            <label className="font-semibold text-sm">End</label>
            <DatePicker
              selected={newEvent.end}
              onChange={(d) => setNewEvent({ ...newEvent, end: d })}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full p-2 border rounded mb-3"
            />

            <textarea
              className="w-full p-2 border rounded mb-3"
              placeholder="Notes"
              value={newEvent.notes}
              onChange={(e) =>
                setNewEvent({ ...newEvent, notes: e.target.value })
              }
            />

            {/* Reminder Timeline */}
            <p className="font-semibold mb-1">Reminder</p>
            <ReminderTimeline
              value={newEvent.reminder}
              onChange={(val) => setNewEvent({ ...newEvent, reminder: val })}
            />

            {newEvent.reminder === "custom" && (
              <>
                <p className="text-sm mt-3">Pick custom reminder time</p>
                <DatePicker
                  selected={newEvent.customReminder}
                  onChange={(d) =>
                    setNewEvent({ ...newEvent, customReminder: d })
                  }
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full p-2 border rounded mb-3"
                />
              </>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 border rounded" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={saveNewEvent}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVENT VIEW POPUP */}
      {selectedEvent && (
        <div className="fixed bottom-5 right-5 bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-xl z-50">
          <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
          <p className="text-gray-400 text-sm">
            {moment(selectedEvent.start).format("MMM DD, YYYY hh:mm A")} →{" "}
            {moment(selectedEvent.end).format("MMM DD, YYYY hh:mm A")}
          </p>
          <p className="text-gray-300 mt-2">{selectedEvent.notes}</p>

          <div className="flex gap-2 justify-end mt-3">
            <button
              className="px-3 py-1 bg-green-600 text-white rounded"
              onClick={() => {
                setEditingEvent(selectedEvent);
                setShowEdit(true);
              }}
            >
              Edit
            </button>

            <button
              className="px-3 py-1 bg-red-600 text-white rounded"
              onClick={() => deleteEvent(selectedEvent.id)}
            >
              Delete
            </button>

            <button
              className="px-3 py-1 border rounded"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && editingEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-[450px]">
            <h2 className="text-xl font-bold mb-3">Edit Trip</h2>

            <input
              className="w-full p-2 border rounded mb-3"
              value={editingEvent.title}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, title: e.target.value })
              }
            />

            <label className="font-semibold text-sm">Start</label>
            <DatePicker
              selected={editingEvent.start}
              onChange={(d) =>
                setEditingEvent({ ...editingEvent, start: d })
              }
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full p-2 border rounded mb-3"
            />

            <label className="font-semibold text-sm">End</label>
            <DatePicker
              selected={editingEvent.end}
              onChange={(d) =>
                setEditingEvent({ ...editingEvent, end: d })
              }
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full p-2 border rounded mb-3"
            />

            <textarea
              className="w-full p-2 border rounded mb-3"
              value={editingEvent.notes}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, notes: e.target.value })
              }
            />

            <p className="font-semibold mb-1">Reminder</p>
            <ReminderTimeline
              value={editingEvent.reminder}
              onChange={(v) =>
                setEditingEvent({ ...editingEvent, reminder: v })
              }
            />

            {editingEvent.reminder === "custom" && (
              <>
                <p className="text-sm mt-3">Pick custom reminder time</p>
                <DatePicker
                  selected={editingEvent.customReminder}
                  onChange={(d) =>
                    setEditingEvent({
                      ...editingEvent,
                      customReminder: d,
                    })
                  }
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full p-2 border rounded mb-3"
                />
              </>
            )}

            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={() => deleteEvent(editingEvent.id)}
              >
                Delete
              </button>

              <div className="flex gap-2">
                <button
                  className="px-4 py-2 border rounded"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-green-600 text-white rounded"
                  onClick={saveEditedEvent}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prevent Tailwind from breaking RBC layout */}
      <style>{`
        .rbc-calendar * { box-sizing: content-box !important; }
      `}</style>
    </div>
  );
}
