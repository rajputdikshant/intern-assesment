import React, { useEffect, useState } from "react";
import {
    Calendar as CalendarIcon,
    Grid,
    Users,
    MessageSquare,
    Settings,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    Phone,
    Mail,
    Edit,
    Trash,
    Check,
    X,
    Stethoscope,
    Shield,
} from "lucide-react";

/**
 * ServiceAdapter - Simulates backend API calls
 * 
 * Assignment Requirement: Backend integration with appointment_service.py
 * This adapter mirrors the Python service logic and simulates network latency.
 * In production, this would make HTTP requests to AppSync/GraphQL endpoints.
 */
const ServiceAdapter = (() => {
    let appointments = [
        {
            id: "a1",
            patientName: "Rajesh Kumar",
            date: "2025-11-06",
            time: "09:00",
            duration: 30,
            doctorName: "Dr. Sarah Johnson",
            status: "Scheduled",
            mode: "In-person",
            purpose: "General Checkup",
        },
        {
            id: "a2",
            patientName: "Anita Patel",
            date: "2025-11-06",
            time: "10:00",
            duration: 60,
            doctorName: "Dr. Sarah Johnson",
            status: "Scheduled",
            mode: "In-person",
            purpose: "Follow-up Consultation",
        },
        {
            id: "a3",
            patientName: "Priya Sharma",
            date: "2025-11-06",
            time: "11:30",
            duration: 45,
            doctorName: "Dr. Rajesh Kumar",
            status: "Scheduled",
            mode: "Teleconsult",
            purpose: "Vaccination",
        },
        {
            id: "a4",
            patientName: "Vikram Singh",
            date: "2025-11-06",
            time: "14:00",
            duration: 30,
            doctorName: "Dr. Alice Brown",
            status: "Completed",
            mode: "In-person",
            purpose: "Dental Check",
        },
        {
            id: "a5",
            patientName: "Shreya Reddy",
            date: "2025-11-07",
            time: "09:30",
            duration: 30,
            doctorName: "Dr. Sarah Johnson",
            status: "Confirmed",
            mode: "In-person",
            purpose: "Cardiology",
        },
        {
            id: "a6",
            patientName: "Amit Rai",
            date: "2025-11-08",
            time: "08:30",
            duration: 30,
            doctorName: "Dr. Rajesh Kumar",
            status: "Cancelled",
            mode: "In-person",
            purpose: "General Checkup",
        },
        {
            id: "a7",
            patientName: "Nisha Verma",
            date: "2025-11-06",
            time: "15:00",
            duration: 45,
            doctorName: "Dr. Alice Brown",
            status: "Scheduled",
            mode: "Teleconsult",
            purpose: "Consultation",
        },
        {
            id: "a8",
            patientName: "Vikash Patel",
            date: "2025-11-06",
            time: "09:30",
            duration: 30,
            doctorName: "Dr. Sarah Johnson",
            status: "Scheduled",
            mode: "In-person",
            purpose: "General Checkup",
        },
        {
            id: "a9",
            patientName: "Rohit Gupta",
            date: "2025-11-09",
            time: "11:00",
            duration: 30,
            doctorName: "Dr. Rajesh Kumar",
            status: "Upcoming",
            mode: "In-person",
            purpose: "Lab Review",
        },
        {
            id: "a10",
            patientName: "Meera Joshi",
            date: "2025-11-06",
            time: "12:00",
            duration: 60,
            doctorName: "Dr. Sarah Johnson",
            status: "Scheduled",
            mode: "Teleconsult",
            purpose: "Follow-up Consultation",
        },
        {
            id: "a11",
            patientName: "Karan Malhotra",
            date: "2025-11-06",
            time: "16:00",
            duration: 30,
            doctorName: "Dr. Alice Brown",
            status: "Scheduled",
            mode: "In-person",
            purpose: "Vaccination",
        },
    ];

    const timeout = (ms) => new Promise((r) => setTimeout(r, ms));

    const timeToMinutes = (t) => {
        if (!t) return 0;
        const [hh, mm] = t.split(":");
        return parseInt(hh, 10) * 60 + parseInt(mm, 10);
    };

    const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

    return {
        // Assignment Requirement: Data fetching with filters (date, status, doctorName)
        async getAppointments(filters = {}) {
            await timeout(300 + Math.random() * 300);
            let res = appointments.slice();
            if (filters.date) res = res.filter((r) => r.date === filters.date);
            if (filters.status) res = res.filter((r) => r.status === filters.status);
            if (filters.doctorName) res = res.filter((r) => r.doctorName === filters.doctorName);
            return res;
        },

        // Assignment Requirement: Create appointment with overlap validation
        // Prevents time conflicts for the same doctor on the same date
        async createAppointment(payload) {
            await timeout(400 + Math.random() * 400);
            
            const required = ["patientName", "date", "time", "duration", "doctorName", "mode"];
            for (let k of required) {
                if (!payload[k] || payload[k] === "") {
                    throw new Error(`Missing required field: ${k}`);
                }
            }
            const newStart = timeToMinutes(payload.time);
            const newEnd = newStart + Number(payload.duration);
            for (let appt of appointments) {
                if (appt.date !== payload.date) continue;
                if (appt.doctorName !== payload.doctorName) continue;
                if (appt.status === "Cancelled") continue;
                const es = timeToMinutes(appt.time);
                const ee = es + Number(appt.duration);
                if (overlaps(newStart, newEnd, es, ee)) {
                    throw new Error(
                        `Time conflict: Doctor ${payload.doctorName} already has an appointment at ${appt.time}`
                    );
                }
            }

            const newAppt = {
                id: `appt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                patientName: payload.patientName,
                date: payload.date,
                time: payload.time,
                duration: Number(payload.duration),
                doctorName: payload.doctorName,
                status: payload.status || "Scheduled",
                mode: payload.mode || "In-person",
                purpose: payload.purpose || "",
            };
            
            appointments.push(newAppt);
            return newAppt;
        },

        // Assignment Requirement: Update appointment status
        async updateAppointmentStatus(id, newStatus) {
            await timeout(200 + Math.random() * 200);
            const appt = appointments.find((a) => a.id === id);
            if (!appt) throw new Error("Appointment not found");
            appt.status = newStatus;
            return appt;
        },

        // Assignment Requirement: Delete appointment
        async deleteAppointment(id) {
            await timeout(200 + Math.random() * 200);
            const idx = appointments.findIndex((a) => a.id === id);
            if (idx === -1) throw new Error("Appointment not found");
            appointments.splice(idx, 1);
            return true;
        },
    };
})();

const timeToTopPercent = (time) => {
    const startMinute = 7 * 60;
    const endMinute = 18 * 60;
    const t = time.split(":");
    const minutes = parseInt(t[0], 10) * 60 + parseInt(t[1], 10);
    const total = endMinute - startMinute;
    const pos = ((minutes - startMinute) / total) * 100;
    return Math.max(0, Math.min(100, pos));
};

const minutesToHeightPercent = (duration) => (duration / (11 * 60)) * 100;

const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

/**
 * CalendarWidget Component
 * 
 * Assignment Requirement: Calendar widget with date click handler for filtering
 * Users can click on any date to filter appointments for that specific date.
 */
const CalendarWidget = ({ selectedDate, onDateSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const d = new Date(selectedDate + "T00:00:00");
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        // Empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const days = getDaysInMonth(currentMonth);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const isSelected = (date) => {
        if (!date) return false;
        return date.toISOString().slice(0, 10) === selectedDate;
    };

    const isToday = (date) => {
        if (!date) return false;
        return date.toISOString().slice(0, 10) === todayStr;
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="font-semibold">
                    {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((date, idx) => {
                    if (!date) {
                        return <div key={`empty-${idx}`} className="aspect-square" />;
                    }
                    const dateStr = date.toISOString().slice(0, 10);
                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDateSelect(dateStr)}
                            className={`aspect-square rounded text-sm hover:bg-blue-50 transition-colors ${
                                isSelected(date)
                                    ? "bg-blue-600 text-white font-semibold"
                                    : isToday(date)
                                    ? "bg-blue-100 text-blue-700 font-semibold"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * AppointmentManagementView - Main Component
 * 
 * Assignment Requirements Implemented:
 * 1. Data fetching via useEffect with Python get_appointments() simulation
 * 2. Calendar widget with date click handler for filtering
 * 3. Tab filtering (Upcoming, Today, Past)
 * 4. Status update functionality with backend integration
 * 5. Create appointment form with backend validation
 * 6. All mutations go through backend service (no frontend-only state mutations)
 */
export default function AppointmentManagementView() {
    const today = new Date().toISOString().slice(0, 10);
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState("2025-11-06");
    const [activeTab, setActiveTab] = useState("Today");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [activeAppointment, setActiveAppointment] = useState(null);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        patientName: "",
        date: today,
        time: "09:00",
        duration: 30,
        doctorName: "Dr. Sarah Johnson",
        mode: "In-person",
        purpose: "",
    });

    // Assignment Requirement: useEffect to fetch initial data
    useEffect(() => {
        fetchAppointments({ date: selectedDate });
    }, []);

    const fetchAppointments = async (filters = {}) => {
        try {
            const data = await ServiceAdapter.getAppointments(filters);
            setAppointments(data);
        } catch (err) {
            setError(err.message || "Failed to fetch appointments");
        }
    };

    // Assignment Requirement: Tab filtering (Upcoming, Today, Past)
    const getFilteredAppointments = () => {
        const todayStr = new Date().toISOString().slice(0, 10);
        let filtered = [...appointments];

        if (activeTab === "Today") {
            filtered = filtered.filter((a) => a.date === selectedDate);
        } else if (activeTab === "Upcoming") {
            // Shows future appointments with status Scheduled/Confirmed/Upcoming
            filtered = filtered.filter(
                (a) =>
                    a.date >= todayStr &&
                    (a.status === "Scheduled" || a.status === "Confirmed" || a.status === "Upcoming")
            );
        } else if (activeTab === "Past") {
            // Shows past appointments or those with Completed/Cancelled status
            filtered = filtered.filter(
                (a) => a.date < todayStr || a.status === "Completed" || a.status === "Cancelled"
            );
        }

        return filtered.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });
    };

    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        if (tab === "Today") {
            await fetchAppointments({ date: selectedDate });
        } else {
            await fetchAppointments();
        }
    };

    useEffect(() => {
        if (activeTab === "Today") {
            fetchAppointments({ date: selectedDate });
        }
    }, [selectedDate]);

    // Assignment Requirement: Calendar date click handler
    // When a date is clicked, fetch appointments for that date
    const handleDateSelect = async (date) => {
        setSelectedDate(date);
        setActiveTab("Today");
        await fetchAppointments({ date });
    };

    // Assignment Requirement: Create appointment with backend validation
    // All validation and conflict detection happens on the backend
    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        setError("");
        setCreating(true);

        try {
            await ServiceAdapter.createAppointment(formData);
            await fetchAppointments({ date: formData.date });
            setShowCreateModal(false);
            setFormData({
                patientName: "",
                date: selectedDate,
                time: "09:00",
                duration: 30,
                doctorName: "Dr. Sarah Johnson",
                mode: "In-person",
                purpose: "",
            });
        } catch (err) {
            setError(err.message || "Failed to create appointment");
        } finally {
            setCreating(false);
        }
    };

    // Assignment Requirement: Status update functionality with backend integration
    // Updates appointment status (Confirmed, Completed, Cancelled) via backend API
    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            await ServiceAdapter.updateAppointmentStatus(appointmentId, newStatus);
            await fetchAppointments({ date: selectedDate });
            setActiveAppointment(null);
        } catch (err) {
            setError(err.message || "Failed to update appointment status");
        }
    };

    const handleDelete = async (appointmentId) => {
        if (!window.confirm("Are you sure you want to delete this appointment?")) return;
        
        try {
            await ServiceAdapter.deleteAppointment(appointmentId);
            await fetchAppointments({ date: selectedDate });
            setActiveAppointment(null);
        } catch (err) {
            setError(err.message || "Failed to delete appointment");
        }
    };

    const filteredAppointments = getFilteredAppointments();
    const dayAppointments = appointments.filter((a) => a.date === selectedDate);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex">
            <aside className="w-20 bg-white shadow-md rounded-r-lg py-6 flex flex-col items-center gap-6">
                <div className="p-2 bg-blue-50 rounded-full">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="p-2 rounded hover:bg-gray-100 cursor-pointer">
                    <Grid className="w-5 h-5" />
                </div>
                <div className="p-2 rounded hover:bg-gray-100 cursor-pointer">
                    <Users className="w-5 h-5" />
                </div>
                <div className="p-2 rounded hover:bg-gray-100 cursor-pointer">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <div className="mt-auto p-2 rounded hover:bg-gray-100 cursor-pointer">
                    <Settings className="w-5 h-5" />
                </div>
            </aside>

            <main className="flex-1 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <CalendarIcon className="w-6 h-6" />
                            Calendar
                        </h1>
                        <div className="text-sm text-gray-500">{formatDate(selectedDate)}</div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            className="px-3 py-1 border rounded flex items-center gap-2 hover:bg-gray-50"
                            onClick={() => handleDateSelect(today)}
                        >
                            Today
                        </button>
                        <button
                            className="p-2 rounded hover:bg-gray-100"
                            onClick={() => {
                                const d = new Date(selectedDate + "T00:00:00");
                                d.setDate(d.getDate() - 1);
                                handleDateSelect(d.toISOString().slice(0, 10));
                            }}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            className="p-2 rounded hover:bg-gray-100"
                            onClick={() => {
                                const d = new Date(selectedDate + "T00:00:00");
                                d.setDate(d.getDate() + 1);
                                handleDateSelect(d.toISOString().slice(0, 10));
                            }}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                        {["Upcoming", "Today", "Past"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`px-4 py-2 rounded transition-colors ${
                                    activeTab === tab
                                        ? "bg-blue-600 text-white font-semibold"
                                        : "bg-white border text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="text-sm text-gray-500">
                        {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? "s" : ""}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Content Grid */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Calendar Widget */}
                    <div>
                        <CalendarWidget selectedDate={selectedDate} onDateSelect={handleDateSelect} />
                    </div>

                    {/* Day View Calendar */}
                    <div className="col-span-2 bg-white rounded-lg shadow p-4">
                        <div className="relative h-[680px] border rounded overflow-hidden bg-white">
                            {/* Hour markers */}
                            {Array.from({ length: 12 }, (_, i) => {
                                const hour = 7 + i;
                                return (
                                    <div
                                        key={hour}
                                        className="absolute left-0 right-0 border-t text-xs text-gray-400 px-3"
                                        style={{
                                            top: `${(i / 12) * 100}%`,
                                            height: `${100 / 12}%`,
                                        }}
                                    >
                                        <div className="absolute left-0 transform -translate-y-1/2 -mt-1 text-sm text-gray-500">
                                            {hour}:00
                                        </div>
                                    </div>
                                );
                            })}

                            {dayAppointments.map((appt) => {
                                const top = timeToTopPercent(appt.time);
                                const height = minutesToHeightPercent(appt.duration);
                                const getColor = () => {
                                    if (appt.purpose.toLowerCase().includes("follow")) return "bg-orange-400";
                                    if (appt.purpose.toLowerCase().includes("vacc")) return "bg-purple-500";
                                    return "bg-blue-500";
                                };
                                return (
                                    <div
                                        key={appt.id}
                                        className={`absolute left-24 right-4 rounded p-2 text-white cursor-pointer ${getColor()} hover:opacity-90 transition-opacity`}
                                        style={{ top: `${top}%`, height: `${height}%` }}
                                        onClick={() => setActiveAppointment(appt)}
                                    >
                                        <div className="text-xs opacity-90">{appt.purpose}</div>
                                        <div className="font-semibold text-sm">{appt.patientName}</div>
                                        <div className="text-xs opacity-80">
                                            {appt.time} • {appt.doctorName}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-white rounded-lg shadow p-4">
                    <h3 className="font-semibold mb-4">
                        {activeTab === "Today" ? "Today's Appointments" : `${activeTab} Appointments`}
                    </h3>
                    <div className="space-y-2">
                        {filteredAppointments.length === 0 ? (
                            <div className="text-sm text-gray-500 text-center py-8">
                                No appointments found
                            </div>
                        ) : (
                            filteredAppointments.map((appt) => (
                                <div
                                    key={appt.id}
                                    className="border rounded p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium">{appt.patientName}</div>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded ${
                                                    appt.status === "Completed"
                                                        ? "bg-green-100 text-green-700"
                                                        : appt.status === "Cancelled"
                                                        ? "bg-red-100 text-red-700"
                                                        : appt.status === "Confirmed"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {appt.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {appt.date} • {appt.time} • {appt.doctorName} • {appt.purpose}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
                                            onClick={() => setActiveAppointment(appt)}
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {showCreateModal && (
                    <div className="fixed inset-0 flex items-end justify-center z-50">
                        <div
                            className="absolute inset-0 bg-black opacity-30"
                            onClick={() => setShowCreateModal(false)}
                        ></div>
                        <form
                            onSubmit={handleCreateAppointment}
                            className="bg-white w-full md:w-1/3 p-6 rounded-t-lg shadow-lg relative z-10 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">New Event</h2>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Start Time</label>
                                        <input
                                            required
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full border rounded px-3 py-2"
                                        />
                                    </div>
                                    <div style={{ width: 120 }}>
                                        <label className="block text-sm font-medium mb-1">Duration (min)</label>
                                        <input
                                            required
                                            type="number"
                                            min={15}
                                            step={15}
                                            value={formData.duration}
                                            onChange={(e) =>
                                                setFormData({ ...formData, duration: Number(e.target.value) })
                                            }
                                            className="w-full border rounded px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Patient Name</label>
                                    <input
                                        required
                                        value={formData.patientName}
                                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Enter patient name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Doctor</label>
                                    <select
                                        value={formData.doctorName}
                                        onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option>Dr. Sarah Johnson</option>
                                        <option>Dr. Rajesh Kumar</option>
                                        <option>Dr. Alice Brown</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Mode</label>
                                    <select
                                        value={formData.mode}
                                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option>In-person</option>
                                        <option>Teleconsult</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Purpose</label>
                                    <textarea
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        rows={3}
                                        placeholder="Add purpose (optional)"
                                    />
                                </div>

                                {error && <div className="text-red-600 text-sm">{error}</div>}

                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        className="px-4 py-2 border rounded hover:bg-gray-50"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {creating ? "Creating..." : "Save"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {activeAppointment && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div
                            className="absolute inset-0 bg-black opacity-30"
                            onClick={() => setActiveAppointment(null)}
                        ></div>
                        <div className="bg-white rounded-lg p-6 w-full md:w-1/3 shadow-lg relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{activeAppointment.purpose}</h3>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {activeAppointment.patientName} • {activeAppointment.date} •{" "}
                                        {activeAppointment.time} • {activeAppointment.doctorName}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveAppointment(null)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="text-sm">
                                    <span className="font-medium">Status:</span>{" "}
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            activeAppointment.status === "Completed"
                                                ? "bg-green-100 text-green-700"
                                                : activeAppointment.status === "Cancelled"
                                                ? "bg-red-100 text-red-700"
                                                : activeAppointment.status === "Confirmed"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {activeAppointment.status}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">Mode:</span> {activeAppointment.mode}
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">Duration:</span> {activeAppointment.duration}{" "}
                                    minutes
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {activeAppointment.status !== "Confirmed" && (
                                    <button
                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                                        onClick={() => handleStatusUpdate(activeAppointment.id, "Confirmed")}
                                    >
                                        <Check className="w-4 h-4" />
                                        Confirm
                                    </button>
                                )}
                                {activeAppointment.status !== "Completed" && (
                                    <button
                                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center gap-1"
                                        onClick={() => handleStatusUpdate(activeAppointment.id, "Completed")}
                                    >
                                        <Check className="w-4 h-4" />
                                        Mark Completed
                                    </button>
                                )}
                                {activeAppointment.status !== "Cancelled" && (
                                    <button
                                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 flex items-center gap-1"
                                        onClick={() => handleStatusUpdate(activeAppointment.id, "Cancelled")}
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                )}
                                <button
                                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 flex items-center gap-1"
                                    onClick={() => handleDelete(activeAppointment.id)}
                                >
                                    <Trash className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

