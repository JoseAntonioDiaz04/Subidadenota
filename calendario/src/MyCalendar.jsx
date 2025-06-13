import { useState, useEffect } from "react";

const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Genera los días del mes con nombre del día y número
const generateCalendar = (date) => {
  const days = [];
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();
  
  // Establece la fecha al primer día del mes actual
  date = new Date(currentYear, currentMonth, 1);
  
  // Obtiene el día de la semana del primer día (0 es domingo, 1 es lunes...)
  let firstDayOfMonth = date.getDay();
  firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Ajuste para que lunes sea 0
  
  // Añade días vacíos al principio para alinear correctamente el primer día
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({
      id: "empty-" + i,
      isEmpty: true
    });
  }
  
  // Calcula el último día del mes actual
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Añade todos los días del mes actual
  for (let i = 1; i <= lastDay; i++) {
    const dayDate = new Date(currentYear, currentMonth, i);
    const dayOfWeek = dayDate.getDay();
    
    days.push({
      id: i,
      number: i,
      date: dayDate,
      isEmpty: false
    });
  }
  
  return days;
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState(generateCalendar(currentDate));
  const [selectedDay, setSelectedDay] = useState(null);
  const [events, setEvents] = useState({});
  const [newEvent, setNewEvent] = useState({ time: '', description: '' });
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Cargar eventos del localStorage al iniciar
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Guardar eventos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const selectDay = (day) => {
    if (!day.isEmpty) {
      setSelectedDay(day);
      setNewEvent({ time: '', description: '' });
      setEditingEvent(null);
    }
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!selectedDay || !newEvent.time || !newEvent.description) return;

    const eventKey = `${selectedDay.date.toISOString().split('T')[0]}`;
    const updatedEvents = {
      ...events,
      [eventKey]: [...(events[eventKey] || []), { ...newEvent, id: Date.now() }]
    };
    
    setEvents(updatedEvents);
    setNewEvent({ time: '', description: '' });
  };

  const handleDeleteEvent = (eventId) => {
    const eventKey = `${selectedDay.date.toISOString().split('T')[0]}`;
    const updatedEvents = {
      ...events,
      [eventKey]: events[eventKey].filter(event => event.id !== eventId)
    };
    setEvents(updatedEvents);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({ time: event.time, description: event.description });
  };

  const handleUpdateEvent = (e) => {
    e.preventDefault();
    if (!selectedDay || !editingEvent) return;

    const eventKey = `${selectedDay.date.toISOString().split('T')[0]}`;
    const updatedEvents = {
      ...events,
      [eventKey]: events[eventKey].map(event => 
        event.id === editingEvent.id ? { ...newEvent, id: event.id } : event
      )
    };
    
    setEvents(updatedEvents);
    setEditingEvent(null);
    setNewEvent({ time: '', description: '' });
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
    setDays(generateCalendar(newDate));
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => changeMonth(-1)}
            className="hover:bg-blue-700 px-3 py-1 rounded"
          >
            ←
          </button>
          <h2 className="text-xl font-bold">{currentMonth} {currentYear}</h2>
          <button 
            onClick={() => changeMonth(1)}
            className="hover:bg-blue-700 px-3 py-1 rounded"
          >
            →
          </button>
        </div>
      </div>
      
      {/* Cabecera de días de la semana */}
      <div className="grid grid-cols-7 bg-gray-100 font-bold">
        {weekdays.map((day) => (
          <div key={day} className="p-2 text-center border-b">{day}</div>
        ))}
      </div>
      
      {/* Cuadrícula del calendario */}
      <div className="grid grid-cols-7 bg-white rounded-b-lg shadow">
        {days.map((day) => {
          const eventKey = day.date ? day.date.toISOString().split('T')[0] : null;
          const dayEvents = eventKey ? events[eventKey] || [] : [];
          
          return (
            <div
              key={day.id}
              className={`min-h-16 pb-4 border ${day.isEmpty ? 'bg-gray-50' : 'hover:bg-blue-50 cursor-pointer'} ${
                selectedDay && selectedDay.id === day.id ? 'bg-blue-100 ring-2 ring-blue-400' : ''
              }`}
              onClick={() => selectDay(day)}
            >
              {!day.isEmpty && (
                <>
                  <div className="text-md text-left font-medium">{day.number}</div>
                  {dayEvents.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      {dayEvents.length} evento(s)
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Panel informativo y formulario de eventos */}
      {selectedDay && (
        <div className="mt-4 p-4 border rounded-lg bg-white shadow">
          <h3 className="text-lg font-bold mb-2">
            {selectedDay.number} de {currentMonth}
          </h3>
          
          {/* Formulario para añadir/editar eventos */}
          <form onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent} className="mb-4">
            <div className="flex gap-2">
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Descripción del evento"
                className="border p-2 rounded flex-grow"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {editingEvent ? 'Actualizar' : 'Añadir'}
              </button>
              {editingEvent && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingEvent(null);
                    setNewEvent({ time: '', description: '' });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Lista de eventos del día */}
          {events[selectedDay.date.toISOString().split('T')[0]]?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold mb-2">Eventos del día:</h4>
              <ul className="space-y-2">
                {events[selectedDay.date.toISOString().split('T')[0]].map((event) => (
                  <li key={event.id} className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.time}</span>
                      <span>{event.description}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}