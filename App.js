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
    CalendarRange,
    Clock,
    Phone,
    Mail,
    Edit,
    Trash,
    Check,
    X,
} from "lucide-react";

const MOCK_APPOINTMENTS = [
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

const ServiceAdapter = (() => {
    let appointments = MOCK_APPOINTMENTS.map((a) => ({ ...a }));

    const timeout = (ms) => new Promise((r) => setTimeout(r, ms));

    const timeToMinutes = (t) => {
        if (!t) return 0;
        const [hh, mm] = t.split(":");
        return parseInt(hh, 10) * 60 + parseInt(mm, 10);
    };

    const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

    return {
        async getAppointments(filters = {}) {
            await timeout(300 + Math.random() * 300);
            let res = appointments.slice();
            if (filters.date) res = res.filter((r) => r.date === filters.date);
            if (filters.status) res = res.filter((r) => r.status === filters.status);
            if (filters.doctorName) res = res.filter((r) => r.doctorName === filters.doctorName);
            return res;
        },

        async createAppointment(payload) {
            await timeout(400 + Math.random() * 400);
            const required = ["patientName", "date", "time", "duration", "doctorName", "mode"];
            for (let k of required) if (!payload[k]) throw new Error(`Missing ${k}`);

            const newStart = timeToMinutes(payload.time);
            const newEnd = newStart + Number(payload.duration);
            for (let appt of appointments) {
                if (appt.date !== payload.date) continue;
                if (appt.doctorName !== payload.doctorName) continue;
                if (appt.status === "Cancelled") continue;
                const es = timeToMinutes(appt.time);
                const ee = es + Number(appt.duration);
                if (overlaps(newStart, newEnd, es, ee)) {
                    throw new Error(`Time conflict with appointment ${appt.id}`);
                }
            }

            const newAppt = {
                id: `js_${Math.random().toString(36).slice(2, 9)}`,
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

        async updateAppointmentStatus(id, status) {
            await timeout(200 + Math.random() * 200);
            const appt = appointments.find((a) => a.id === id);
            if (!appt) throw new Error("Appointment not found");
            appt.status = status;
            return appt;
        },

        async deleteAppointment(id) {
            await timeout(200 + Math.random() * 200);
            const idx = appointments.findIndex((a) => a.id === id);
            if (idx === -1) throw new Error("Not found");
            appointments.splice(idx, 1);
            return true;
        },

        async _reset() {
            appointments = MOCK_APPOINTMENTS.map((a) => ({ ...a }));
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

export default function App() {
    const todayDefault = "2025-11-06"; // for demo
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(todayDefault);
    const [view, setView] = useState("Day");
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ date: todayDefault, time: "09:00", duration: 30, patientName: "", doctorName: "Dr. Sarah Johnson", purpose: "", mode: "In-person" });
    const [tab, setTab] = useState("Today");
    const [error, setError] = useState("");
    const [activeAppt, setActiveAppt] = useState(null);

    useEffect(() => {
        fetchAppointments({ date: selectedDate });
    }, [selectedDate]);

    async function fetchAppointments(filters = {}) {
        const res = await ServiceAdapter.getAppointments(filters);
        setAppointments(res);
    }

    const filteredByTab = () => {
        const now = new Date();
        if (tab === "Today") return appointments.filter((a) => a.date === selectedDate);
        if (tab === "Upcoming") return appointments.filter((a) => a.date >= selectedDate && a.status === "Scheduled");
        if (tab === "Past") return appointments.filter((a) => (a.date < selectedDate) || a.status === "Completed");
        return appointments;
    };

    const dayAppointments = appointments.filter((a) => a.date === selectedDate);

    async function handleCreate(e) {
        e.preventDefault();
        setError("");
        setCreating(true);
        try {
            await ServiceAdapter.createAppointment(form);
            await fetchAppointments({ date: selectedDate });
            setShowCreate(false);
            setForm({ date: selectedDate, time: "09:00", duration: 30, patientName: "", doctorName: "Dr. Sarah Johnson", purpose: "", mode: "In-person" });
        } catch (err) {
            setError(err.message || "Error creating appointment");
        } finally {
            setCreating(false);
        }
    }

    async function handleStatusChange(id, status) {
        await ServiceAdapter.updateAppointmentStatus(id, status);
        await fetchAppointments({ date: selectedDate });
        setActiveAppt(null);
    }

    async function applyTabFilter(t) {
        setTab(t);
        if (t === 'Today') {
            const today = new Date().toISOString().slice(0, 10);
            setSelectedDate(today);
            await fetchAppointments({ date: today });
            return;
        }

        const all = await ServiceAdapter.getAppointments();
        if (t === 'Upcoming') {
            const filtered = all.filter(a => (a.date > selectedDate) && (a.status === 'Scheduled' || a.status === 'Confirmed' || a.status === 'Upcoming'));
            setAppointments(filtered);
            return;
        }

        if (t === 'Past') {
            const filtered = all.filter(a => (a.date < selectedDate) || a.status === 'Completed' || a.status === 'Cancelled');
            setAppointments(filtered);
            return;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex">
            <aside className="w-20 bg-white shadow-md rounded-r-lg py-6 flex flex-col items-center gap-6">
                <div className="p-2 bg-blue-50 rounded-full">
                    <CalendarIcon className="text-blue-600" />
                </div>
                <div className="p-2 rounded hover:bg-gray-100 cursor-pointer">
                    <Grid />
                </div>
                <div className="p-2 rounded hover:bg-gray-100 cursor-pointer">
                    <Users />
                </div>
                <div className="p-2 rounded hover:bg-gray-100 cursor-pointer">
                    <MessageSquare />
                </div>
                <div className="mt-auto p-2 rounded hover:bg-gray-100 cursor-pointer">
                    <Settings />
                </div>
            </aside>

            <main className="flex-1 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">Calendar</h1>
                        <div className="text-sm text-gray-500">Thursday, November 6, 2025</div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="px-3 py-1 border rounded flex items-center gap-2" onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}>
                            Today
                        </button>
                        <button className="p-2 rounded hover:bg-gray-100" onClick={() => changeDate(-1)}><ChevronLeft /></button>
                        <button className="p-2 rounded hover:bg-gray-100" onClick={() => changeDate(1)}><ChevronRight /></button>

                        <select className="border rounded px-3 py-1" value={view} onChange={(e) => setView(e.target.value)}>
                            <option>Day</option>
                            <option>Week</option>
                            <option>Month</option>
                        </select>

                        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowCreate(true)}>
                            <Plus /> <span>Create</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                        {['Upcoming', 'Today', 'Past'].map(t => (
                            <button key={t} onClick={() => applyTabFilter(t)} className={`px-4 py-2 rounded ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{t}</button>
                        ))}
                    </div>

                    <div className="text-sm text-gray-500">{filteredByTab().length} appointments</div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 bg-white rounded-lg shadow p-4">
                        <div className="relative h-[680px] border rounded overflow-hidden bg-white">
                            {Array.from({ length: 12 }, (_, i) => {
                                const hour = 7 + i;
                                return (
                                    <div key={hour} className="absolute left-0 right-0 border-t text-xs text-gray-400 px-3" style={{ top: `${(i / 12) * 100}%`, height: `${100 / 12}%` }}>
                                        <div className="absolute left-0 transform -translate-y-1/2 -mt-1 text-sm text-gray-500">{hour}:00</div>
                                    </div>
                                );
                            })}

                            {dayAppointments.map((a) => {
                                const top = timeToTopPercent(a.time);
                                const height = minutesToHeightPercent(a.duration);
                                const color = a.purpose.toLowerCase().includes("follow") ? "bg-orange-400" : a.purpose.toLowerCase().includes("vacc") ? "bg-purple-500" : "bg-blue-500";
                                return (
                                    <div key={a.id} className={`absolute left-24 right-4 rounded p-2 text-white cursor-pointer ${color}`} style={{ top: `${top}%`, height: `${height}%` }} onClick={() => setActiveAppt(a)}>
                                        <div className="text-xs opacity-90">{a.purpose}</div>
                                        <div className="font-semibold text-sm">{a.patientName}</div>
                                        <div className="text-xs opacity-80">{a.time} • {a.doctorName}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="font-semibold mb-2">Today's Appointments</h3>
                        <div className="space-y-2">
                            {dayAppointments.map((a) => (
                                <div key={a.id} className="border rounded p-2 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium">{a.patientName}</div>
                                        <div className="text-xs text-gray-500">{a.time} • {a.purpose}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="text-sm px-2 py-1 border rounded" onClick={() => setActiveAppt(a)}>Details</button>
                                    </div>
                                </div>
                            ))}
                            {dayAppointments.length === 0 && <div className="text-sm text-gray-500">No appointments for selected date</div>}
                        </div>
                    </div>
                </div>

                {showCreate && (
                    <div className="fixed inset-0 flex items-end justify-center z-50">
                        <div className="absolute inset-0 bg-black opacity-30" onClick={() => setShowCreate(false)}></div>
                        <form onSubmit={handleCreate} className="bg-white w-full md:w-1/3 p-6 rounded-t-lg shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">New Event</h2>
                                <button type="button" onClick={() => setShowCreate(false)}><X /></button>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm">Date</label>
                                <input required type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className="w-full border rounded px-3 py-2" />

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="block text-sm">Start Time</label>
                                        <input required type="time" value={form.time} onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))} className="w-full border rounded px-3 py-2" />
                                    </div>
                                    <div style={{ width: 110 }}>
                                        <label className="block text-sm">Duration (min)</label>
                                        <input required type="number" min={15} step={15} value={form.duration} onChange={(e) => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className="w-full border rounded px-3 py-2" />
                                    </div>
                                </div>

                                <label className="block text-sm">Patient Name</label>
                                <input required value={form.patientName} onChange={(e) => setForm(f => ({ ...f, patientName: e.target.value }))} className="w-full border rounded px-3 py-2" />

                                <label className="block text-sm">Doctor</label>
                                <select value={form.doctorName} onChange={(e) => setForm(f => ({ ...f, doctorName: e.target.value }))} className="w-full border rounded px-3 py-2">
                                    <option>Dr. Sarah Johnson</option>
                                    <option>Dr. Rajesh Kumar</option>
                                    <option>Dr. Alice Brown</option>
                                </select>

                                <label className="block text-sm">Mode</label>
                                <select value={form.mode} onChange={(e) => setForm(f => ({ ...f, mode: e.target.value }))} className="w-full border rounded px-3 py-2">
                                    <option>In-person</option>
                                    <option>Teleconsult</option>
                                </select>

                                <label className="block text-sm">Purpose</label>
                                <textarea value={form.purpose} onChange={(e) => setForm(f => ({ ...f, purpose: e.target.value }))} className="w-full border rounded px-3 py-2" />

                                <div className="text-red-600 text-sm">{error}</div>

                                <div className="flex justify-end gap-2">
                                    <button type="button" className="px-4 py-2 border rounded" onClick={() => setShowCreate(false)}>Cancel</button>
                                    <button type="submit" disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {activeAppt && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="absolute inset-0 bg-black opacity-30" onClick={() => setActiveAppt(null)}></div>
                        <div className="bg-white rounded p-6 w-full md:w-1/3 shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold">{activeAppt.purpose}</h3>
                                    <div className="text-sm text-gray-500">{activeAppt.patientName} • {activeAppt.time} • {activeAppt.doctorName}</div>
                                </div>
                                <button onClick={() => setActiveAppt(null)}><X /></button>
                            </div>

                            <div className="mt-4">
                                <div className="flex gap-2">
                                    {activeAppt.status !== 'Confirmed' && <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => handleStatusChange(activeAppt.id, 'Confirmed')}><Check className="inline" /> Confirm</button>}
                                    {activeAppt.status !== 'Completed' && <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={() => handleStatusChange(activeAppt.id, 'Completed')}><Check className="inline" /> Mark Completed</button>}
                                    {activeAppt.status !== 'Cancelled' && <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => handleStatusChange(activeAppt.id, 'Cancelled')}><Trash className="inline" /> Cancel</button>}
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </main>
        </div>
    );

    function changeDate(deltaDays) {
        const d = new Date(selectedDate + "T00:00:00");
        d.setDate(d.getDate() + deltaDays);
        const iso = d.toISOString().slice(0, 10);
        setSelectedDate(iso);
    }
}
