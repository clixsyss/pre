<template>
  <div class="calendar-page">
    <div class="page-header">
      <div class="header-content">
        <button class="back-button" @click="$router.go(-1)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1>Calendar</h1>
      </div>
      <p class="header-subtitle">View all your events and bookings</p>
    </div>

    <div class="calendar-content">
      <!-- Calendar Navigation -->
      <div class="calendar-navigation">
        <button class="nav-btn" @click="previousMonth">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h2 class="current-month">{{ currentMonthYear }}</h2>
        <button class="nav-btn" @click="nextMonth">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="calendar-container">
        <div class="calendar-header">
          <div class="day-header" v-for="day in dayHeaders" :key="day">{{ day }}</div>
        </div>
        
        <div class="calendar-grid">
          <div 
            v-for="date in calendarDates" 
            :key="date.key"
            class="date-cell"
            :class="{
              'other-month': !date.isCurrentMonth,
              'today': date.isToday,
              'has-events': date.hasEvents,
              'selected': selectedDate?.toDateString() === date.date.toDateString()
            }"
            @click="selectDate(date.date)"
          >
            <span class="date-number">{{ date.day }}</span>
            <div v-if="date.hasEvents" class="event-indicator"></div>
            <div v-if="date.eventCount > 1" class="event-count">{{ date.eventCount }}</div>
          </div>
        </div>
      </div>

      <!-- Events for Selected Date -->
      <div v-if="selectedDate" class="events-section">
        <div class="section-header">
          <h3>Events for {{ formatSelectedDate(selectedDate) }}</h3>
          <button class="clear-selection" @click="selectedDate = null">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div v-if="selectedDateEvents.length > 0" class="events-list">
          <div 
            v-for="event in selectedDateEvents" 
            :key="event.id"
            class="event-card"
            @click="viewEvent(event)"
          >
            <div class="event-icon" :class="getEventTypeClass(event.type)">
              <svg v-if="event.type === 'court'" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="event-info">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-details">
                <span class="event-time">{{ getEventTime(event) }}</span>
                <span v-if="event.location" class="event-location">{{ event.location }}</span>
              </div>
            </div>
            <div class="event-status">
              <span class="status-badge" :class="getStatusClass(event.status)">
                {{ getStatusLabel(event.status) }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-else class="no-events">
          <p>No events scheduled for this date</p>
        </div>
      </div>

      <!-- All Upcoming Events -->
      <div class="upcoming-events-section">
        <h3>All Upcoming Events</h3>
        
        <div v-if="allUpcomingEvents.length > 0" class="upcoming-events-list">
          <div 
            v-for="event in allUpcomingEvents" 
            :key="event.id"
            class="upcoming-event-item"
            @click="viewEvent(event)"
          >
            <div class="event-date">
              <div class="date-day">{{ formatEventDay(event.date) }}</div>
              <div class="date-month">{{ formatEventMonth(event.date) }}</div>
            </div>
            <div class="event-content">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-type">{{ getEventTypeLabel(event.type) }}</div>
            </div>
            <div class="event-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div v-else class="no-upcoming-events">
          <p>No upcoming events</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAcademiesStore } from 'src/stores/academyStore';

// Component name for ESLint
defineOptions({
  name: 'CalendarPage'
});

const router = useRouter();
const academiesStore = useAcademiesStore();

// Reactive data
const currentDate = ref(new Date());
const selectedDate = ref(null);

// Computed properties
const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
});

const dayHeaders = computed(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  // Get first day of month
  const firstDay = new Date(year, month, 1);
  
  // Get start date (including previous month's days to fill first week)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const isCurrentMonth = date.getMonth() === month;
    const isToday = date.toDateString() === today.toDateString();
    const events = getEventsForDate(date);
    const hasEvents = events.length > 0;
    const eventCount = events.length;
    
    dates.push({
      key: date.toISOString(),
      day: date.getDate(),
      date: date,
      isCurrentMonth,
      isToday,
      hasEvents,
      eventCount
    });
  }
  
  return dates;
});

const selectedDateEvents = computed(() => {
  if (!selectedDate.value) return [];
  return getEventsForDate(selectedDate.value);
});

const allUpcomingEvents = computed(() => {
  const allBookings = academiesStore.userBookings;
  const events = [];
  
  // Add court bookings as events
  allBookings.forEach(booking => {
    if (booking.type === 'court' && booking.date) {
      events.push({
        id: booking.id,
        title: `${booking.sport} - ${booking.courtName}`,
        date: booking.date,
        type: 'court',
        status: booking.status,
        timeSlots: booking.timeSlots,
        location: booking.courtName
      });
    }
  });
  
  // Add academy programs as events
  allBookings.forEach(booking => {
    if (booking.type === 'academy' && booking.status === 'enrolled') {
      events.push({
        id: booking.id,
        title: booking.programName,
        date: new Date().toISOString(), // Ongoing programs
        type: 'academy',
        status: booking.status,
        location: booking.academyName
      });
    }
  });
  
  // Sort by date
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
});

// Methods
const getEventsForDate = (date) => {
  const dateString = date.toISOString().split('T')[0];
  return allUpcomingEvents.value.filter(event => {
    if (event.type === 'court') {
      return event.date === dateString;
    }
    return false;
  });
};

const selectDate = (date) => {
  selectedDate.value = date;
};

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

const formatSelectedDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatEventDay = (dateString) => {
  if (!dateString) return 'Ongoing';
  return new Date(dateString).getDate();
};

const formatEventMonth = (dateString) => {
  if (!dateString) return 'Ongoing';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short' });
};

const getEventTime = (event) => {
  if (event.type === 'court' && event.timeSlots) {
    return event.timeSlots.join(', ');
  }
  return 'All day';
};

const getEventTypeLabel = (type) => {
  return type === 'court' ? 'Court Booking' : 'Academy Program';
};

const getEventTypeClass = (type) => {
  return type === 'court' ? 'court-event' : 'academy-event';
};

const getStatusLabel = (status) => {
  const statusMap = {
    'confirmed': 'Confirmed',
    'pending': 'Pending',
    'cancelled': 'Cancelled',
    'enrolled': 'Enrolled'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const statusMap = {
    'confirmed': 'confirmed',
    'pending': 'pending',
    'cancelled': 'cancelled',
    'enrolled': 'enrolled'
  };
  return statusMap[status] || 'pending';
};

const viewEvent = () => {
  // Navigate to event details or booking details
  router.push('/my-bookings');
};

// Lifecycle
onMounted(async () => {
  try {
    await academiesStore.fetchUserBookings('current-user-id'); // This should come from auth store
  } catch (error) {
    console.error("Error fetching user bookings:", error);
  }
});
</script>

<style scoped>
.calendar-page {
  padding: 20px 0;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.back-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #f5f5f5;
  color: #333;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.calendar-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.nav-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.current-month {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  min-width: 200px;
  text-align: center;
}

.calendar-container {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.day-header {
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  padding: 12px 8px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.date-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  padding: 8px;
  border: 2px solid transparent;
}

.date-cell:hover {
  background: #fff5f2;
  border-color: #ff6b35;
}

.date-cell.other-month {
  color: #ccc;
}

.date-cell.today {
  background: #ff6b35;
  color: white;
  font-weight: 600;
}

.date-cell.has-events {
  background: #e3f2fd;
  border-color: #1976d2;
}

.date-cell.selected {
  background: #ff6b35;
  color: white;
  font-weight: 600;
}

.date-number {
  font-size: 1rem;
  font-weight: 500;
}

.event-indicator {
  width: 6px;
  height: 6px;
  background: #1976d2;
  border-radius: 50%;
  margin-top: 4px;
}

.event-count {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ff6b35;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.events-section {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.clear-selection {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.clear-selection:hover {
  background: #f5f5f5;
  color: #333;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.event-card:hover {
  background: #fff5f2;
}

.event-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.event-icon.court-event {
  background: #e3f2fd;
  color: #1976d2;
}

.event-icon.academy-event {
  background: #f3e5f5;
  color: #7b1fa2;
}

.event-info {
  flex: 1;
}

.event-title {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
  margin-bottom: 4px;
}

.event-details {
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 0.875rem;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.confirmed {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.enrolled {
  background: #d1ecf1;
  color: #0c5460;
}

.no-events {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

.no-events p {
  margin: 0;
  font-size: 1rem;
}

.upcoming-events-section {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.upcoming-events-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.upcoming-events-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upcoming-event-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upcoming-event-item:hover {
  background: #fff5f2;
}

.event-date {
  text-align: center;
  flex-shrink: 0;
  min-width: 60px;
}

.date-day {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b35;
  line-height: 1;
}

.date-month {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  font-weight: 500;
}

.event-content {
  flex: 1;
}

.event-content .event-title {
  font-size: 1rem;
  margin-bottom: 4px;
}

.event-content .event-type {
  color: #666;
  font-size: 0.875rem;
}

.event-arrow {
  color: #666;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.upcoming-event-item:hover .event-arrow {
  opacity: 1;
}

.no-upcoming-events {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

.no-upcoming-events p {
  margin: 0;
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .calendar-page {
    padding: 16px 0;
  }
  
  .calendar-navigation {
    padding: 16px;
    gap: 16px;
  }
  
  .current-month {
    font-size: 1.25rem;
    min-width: 150px;
  }
  
  .calendar-container,
  .events-section,
  .upcoming-events-section {
    padding: 20px;
  }
  
  .date-cell {
    padding: 6px;
  }
  
  .date-number {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .calendar-navigation {
    flex-direction: column;
    gap: 12px;
  }
  
  .current-month {
    font-size: 1.125rem;
    min-width: auto;
  }
  
  .calendar-container,
  .events-section,
  .upcoming-events-section {
    padding: 16px;
  }
  
  .calendar-header {
    gap: 4px;
  }
  
  .day-header {
    font-size: 0.75rem;
    padding: 8px 4px;
  }
  
  .calendar-grid {
    gap: 4px;
  }
  
  .date-cell {
    padding: 4px;
  }
  
  .date-number {
    font-size: 0.8rem;
  }
  
  .event-card,
  .upcoming-event-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .event-date {
    min-width: auto;
  }
}
</style>
