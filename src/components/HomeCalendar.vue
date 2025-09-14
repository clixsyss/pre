<template>
  <div class="home-calendar-card" @click="navigateToCalendar">
    <div class="card-header">
      <h3>Calendar</h3>
      <div class="header-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <div class="card-content">
      <!-- Calendar Grid -->
      <div class="calendar-grid">
        <div class="calendar-header">
          <div class="month-year">{{ currentMonthYear }}</div>
        </div>
        
        <div class="calendar-days">
          <div class="day-header" v-for="day in dayHeaders" :key="day">{{ day }}</div>
        </div>
        
        <div class="calendar-dates">
          <div 
            v-for="date in calendarDates" 
            :key="date.key"
            class="date-cell"
            :class="{
              'other-month': !date.isCurrentMonth,
              'today': date.isToday,
              'has-events': date.hasEvents
            }"
          >
            <span class="date-number">{{ date.day }}</span>
            <div v-if="date.hasEvents" class="event-indicator"></div>
          </div>
        </div>
      </div>

      <!-- Events Preview -->
      <div class="events-preview">
        <div class="preview-header">
          <h4>Upcoming Events</h4>
          <button class="view-all-btn" @click.stop="navigateToCalendar">
            View All
          </button>
        </div>
        
        <div v-if="upcomingEvents.length > 0" class="events-list">
          <div 
            v-for="event in upcomingEvents.slice(0, 3)" 
            :key="event.id"
            class="event-item"
            @click.stop="viewEvent(event)"
          >
            <div class="event-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="event-info">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-date">{{ formatEventDate(event.date) }}</div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-events">
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
import { getAuth } from 'firebase/auth';

// Component name for ESLint
defineOptions({
  name: 'HomeCalendar'
});

const router = useRouter();
const academiesStore = useAcademiesStore();

// Reactive data
const currentDate = ref(new Date());

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

const upcomingEvents = computed(() => {
  const allBookings = academiesStore.userBookings;
  const events = [];
  
  // Add court bookings as events
  allBookings.forEach(booking => {
    if (booking.type === 'court' && booking.date) {
      events.push({
        id: booking.id,
        title: `${booking.sport} - ${booking.courtName}`,
        date: booking.date,
        type: 'court'
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
        type: 'academy'
      });
    }
  });
  
  // Sort by date
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
});

// Methods
const getEventsForDate = (date) => {
  const dateString = date.toISOString().split('T')[0];
  return upcomingEvents.value.filter(event => {
    if (event.type === 'court') {
      return event.date === dateString;
    }
    return false;
  });
};

const formatEventDate = (dateString) => {
  if (!dateString) return 'Ongoing';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const navigateToCalendar = () => {
  router.push('/calendar');
};

const viewEvent = (event) => {
  // Navigate to event details or booking details
  if (event.type === 'court') {
    router.push('/my-bookings');
  } else {
    router.push('/my-bookings');
  }
};

// Lifecycle
onMounted(async () => {
  try {
    const auth = getAuth();
    if (auth.currentUser) {
      await academiesStore.fetchUserBookings(auth.currentUser.uid);
    }
  } catch (error) {
    console.error("Error fetching user bookings:", error);
  }
});
</script>

<style scoped>
.home-calendar-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.home-calendar-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #AF1E23;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-arrow {
  color: #666;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.home-calendar-card:hover .header-arrow {
  opacity: 1;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.calendar-grid {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.calendar-header {
  text-align: center;
  margin-bottom: 16px;
}

.month-year {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.day-header {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  padding: 8px 4px;
}

.calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.date-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  padding: 4px;
}

.date-cell:hover {
  background: #fff5f2;
}

.date-cell.other-month {
  color: #ccc;
}

.date-cell.today {
  background: #AF1E23;
  color: white;
  font-weight: 600;
}

.date-cell.has-events {
  background: #e3f2fd;
}

.date-number {
  font-size: 0.875rem;
  font-weight: 500;
}

.event-indicator {
  width: 4px;
  height: 4px;
  background: #1976d2;
  border-radius: 50%;
  margin-top: 2px;
}

.events-preview {
  border-top: 1px solid #e1e5e9;
  padding-top: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.view-all-btn {
  background: none;
  border: none;
  color: #AF1E23;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.view-all-btn:hover {
  color: #AF1E23;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.event-item:hover {
  background: #fff5f2;
}

.event-icon {
  color: #AF1E23;
  flex-shrink: 0;
}

.event-info {
  flex: 1;
}

.event-title {
  font-weight: 500;
  color: #333;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.event-date {
  color: #666;
  font-size: 0.75rem;
}

.no-events {
  text-align: center;
  color: #999;
  font-size: 0.875rem;
  padding: 20px;
}

.no-events p {
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .home-calendar-card {
    padding: 16px;
  }
  
  .calendar-grid {
    padding: 12px;
  }
  
  .date-cell {
    padding: 2px;
  }
  
  .date-number {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .card-header h3 {
    font-size: 1rem;
  }
  
  .month-year {
    font-size: 0.9rem;
  }
  
  .day-header {
    font-size: 0.7rem;
    padding: 6px 2px;
  }
  
  .date-number {
    font-size: 0.75rem;
  }
}
</style>
