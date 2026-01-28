<template>
  <div class="profile-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ $t('loadingProfile') }}</p>
    </div>

    <!-- Profile Content -->
    <div v-else class="profile-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="profile-avatar">
            <img v-if="userProfile?.documents?.profilePictureUrl" :src="userProfile.documents.profilePictureUrl"
              alt="Profile Picture" class="avatar-image" />
            <div v-else class="avatar-initial">
              {{ getInitials(userProfile?.firstName, userProfile?.lastName) || '?' }}
            </div>
            <div v-if="userProfile?.registrationStatus" class="avatar-status" :class="getStatusClass(userProfile?.registrationStatus)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <!-- Upload Documents Button -->
            <button @click="showUploadDocumentsModal = true" class="upload-documents-btn" title="Upload Profile Picture & ID Documents">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="hero-text">
            <h1 class="hero-title">{{ getFullName(userProfile?.firstName, userProfile?.lastName) || $t('loadingProfile') }}</h1>
            <p class="hero-subtitle">{{ userProfile?.email || $t('notProvided') }}</p>
            <!-- <div class="profile-badges">
          <span class="status-badge" :class="getStatusClass(userProfile.registrationStatus)">
            {{ formatStatus(userProfile.registrationStatus) }}
          </span>
            </div> -->
          </div>
        </div>
      </div>

      <!-- Personal Information Accordion -->
      <div class="accordion-section">
        <button @click="toggleAccordion('personal')" class="accordion-header"
          :class="{ active: activeAccordion === 'personal' }">
          <div class="accordion-title">
            <div class="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <div class="section-text">
              <h3>{{ $t('personalInformation') }}</h3>
              <p>{{ $t('personalDetails') }}</p>
            </div>
          </div>
          <div class="accordion-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="accordion-content" :class="{ active: activeAccordion === 'personal' }">
          <div class="info-grid">
            <div class="info-card">
              <div class="info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
              <div class="info-content">
                <label>{{ $t('fullName') }}</label>
                <span>{{ getFullName(userProfile?.firstName, userProfile?.lastName) || $t('notProvided') }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22 16.92V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V16.92L8.5 10.92C9.5 9.92 11 9.92 12 10.92L22 16.92Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="info-content">
                <label>{{ $t('email') }}</label>
                <span>{{ userProfile?.email || $t('notProvided') }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22 16.92V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V16.92L8.5 10.92C9.5 9.92 11 9.92 12 10.92L22 16.92Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="info-content">
                <label>{{ $t('phoneNumber') }}</label>
                <span>{{ userProfile?.mobile || $t('notProvided') }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" />
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" />
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" />
                </svg>
              </div>
              <div class="info-content">
                <label>{{ $t('dateOfBirth') }}</label>
                <span>{{ formatBirthDate(userProfile?.dateOfBirth) || $t('notProvided') }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                  <path d="M8 14S9.5 16 12 16S16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
              <div class="info-content">
                <label>{{ $t('gender') }}</label>
                <span>{{ formatGender(userProfile?.gender) || $t('notProvided') }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" />
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" />
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" />
                </svg>
              </div>
              <div class="info-content">
                <label>{{ $t('nationalId') }}</label>
                <span>{{ userProfile?.nationalId || $t('notProvided') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Family Members Accordion -->
      <div v-if="familyMembers.length > 0" class="accordion-section">
        <button @click="toggleAccordion('family')" class="accordion-header"
          :class="{ active: activeAccordion === 'family' }">
          <div class="accordion-title">
            <div class="section-icon family-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17 20H22V18C22 16.3431 20.6569 15 19 15C18.0444 15 17.1931 15.4468 16.6438 16.1429M17 20H7M17 20V18C17 17.3438 16.8736 16.717 16.6438 16.1429M7 20H2V18C2 16.3431 3.34315 15 5 15C5.95561 15 6.80686 15.4468 7.35625 16.1429M7 20V18C7 17.3438 7.12642 16.717 7.35625 16.1429M7.35625 16.1429C8.0935 14.301 9.89482 13 12 13C14.1052 13 15.9065 14.301 16.6438 16.1429M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7ZM21 10C21 11.1046 20.1046 12 19 12C17.8954 12 17 11.1046 17 10C17 8.89543 17.8954 8 19 8C20.1046 8 21 8.89543 21 10ZM7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10C3 8.89543 3.89543 8 5 8C6.10457 8 7 8.89543 7 10Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="section-text">
              <h3>{{ $t('familyMembers') }}</h3>
              <p>{{ familyMembers.length }} {{ familyMembers.length === 1 ? $t('member') : $t('members') }}</p>
            </div>
          </div>
          <div class="accordion-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="accordion-content" :class="{ active: activeAccordion === 'family' }">
          <div class="family-members-grid">
            <div v-for="member in familyMembers" :key="member.id" class="family-member-card">
              <div class="member-avatar">
                <img v-if="member.documents?.profilePictureUrl" :src="member.documents.profilePictureUrl"
                  alt="Member Picture" class="avatar-image-small" />
                <div v-else class="avatar-initial-small">
                  {{ getInitials(member.firstName, member.lastName) }}
                </div>
              </div>
              <div class="member-info">
                <h4 class="member-name">{{ getFullName(member.firstName, member.lastName) }}</h4>
                <p class="member-role">{{ formatRole(member.role) }}</p>
                <div class="member-meta">
                  <span class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    {{ member.email }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Violations & Fines Accordion -->
      <div class="accordion-section">
        <button @click="toggleAccordion('violations')" class="accordion-header"
          :class="{ active: activeAccordion === 'violations' }">
          <div class="accordion-title">
            <div class="section-icon violations-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="section-text">
              <h3>{{ $t('finesAndViolations') }}</h3>
              <p>{{ $t('viewMyViolations') }}</p>
            </div>
          </div>
          <div class="accordion-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="accordion-content" :class="{ active: activeAccordion === 'violations' }">
          <div class="violations-container">
            <div class="violations-summary">
              <div class="violations-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ violationStats.total }}</span>
                  <span class="stat-label">{{ $t('total') }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ violationStats.pending }}</span>
                  <span class="stat-label">{{ $t('pendingFines') }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ violationStats.paid }}</span>
                  <span class="stat-label">{{ $t('paidFines') }}</span>
                </div>
              </div>
            </div>

            <button @click="handleViolationChat" class="violations-btn">
              <div class="violations-btn-content">
                <div class="violations-btn-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <!-- Notification Badge for Pending Violations -->
                  <div v-if="violationStats.pending > 0" class="notification-badge violations-badge">
                    {{ violationStats.pending }}
                  </div>
                </div>
                <div class="violations-btn-text">
                  <h4>{{ $t('viewMyViolations') }}</h4>
                  <p>{{ $t('seeDetails') }}</p>
                </div>
              </div>
              <div class="violations-btn-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
            </button>

            <div v-if="violationStats.total === 0" class="no-violations">
              <p>{{ $t('cleanRecord') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Complaints & Support Accordion -->
      <div class="accordion-section">
        <button @click="toggleAccordion('complaints')" class="accordion-header"
          :class="{ active: activeAccordion === 'complaints' }">
          <div class="accordion-title">
            <div class="section-icon complaints-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="section-text">
              <h3>{{ $t('complaints') }}</h3>
              <p>{{ $t('trackComplaints') }}</p>
            </div>
          </div>
          <div class="accordion-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="accordion-content" :class="{ active: activeAccordion === 'complaints' }">
          <div class="complaints-container">
            <div class="complaints-summary">
              <div class="complaints-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ complaintStats.total }}</span>
                  <span class="stat-label">{{ $t('total') }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ complaintStats.open }}</span>
                  <span class="stat-label">{{ $t('open') }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ complaintStats.resolved }}</span>
                  <span class="stat-label">{{ $t('resolved') }}</span>
                </div>
              </div>
            </div>

            <button @click="handleComplaintChat" class="complaints-btn">
              <div class="complaints-btn-content">
                <div class="complaints-btn-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <!-- Notification Badge for Open Complaints -->
                  <div v-if="complaintStats.open > 0" class="notification-badge complaints-badge">
                    {{ complaintStats.open }}
                  </div>
                </div>
                <div class="complaints-btn-text">
                  <h4>{{ $t('viewAllComplaints') }}</h4>
                  <p>{{ $t('submitNewComplaints') }}</p>
                </div>
              </div>
              <div class="complaints-btn-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
            </button>

            <div v-if="complaintStats.total === 0" class="no-complaints">
              <p>{{ $t('noComplaintsMessage') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Support Accordion -->
      <div class="accordion-section">
        <button @click="handleSupport" class="accordion-header support-header">
          <div class="accordion-title">
            <div class="section-icon support-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="section-text">
              <h3>{{ $t('support') }}</h3>
              <p>{{ $t('getSupportHelp') }}</p>
            </div>
          </div>
          <div class="accordion-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
      </div>

      <!-- Current Projects Accordion -->
      <div class="accordion-section">
        <button @click="toggleAccordion('projects')" class="accordion-header"
          :class="{ active: activeAccordion === 'projects' }">
          <div class="accordion-title">
            <div class="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <div class="section-text">
              <h3>{{ $t('manageUnits') }}</h3>
              <p>{{ $t('manageUnitsDesc') }}</p>
            </div>
          </div>
          <div class="accordion-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="accordion-content" :class="{ active: activeAccordion === 'projects' }">
          <!-- Join Project Button -->
          <div class="join-project-section">
            <button @click="showAddProjectModal = true" class="add-project-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              {{ $t('addUnit') }}
            </button>
          </div>

          <!-- Unified Project Management -->
          <div v-if="userProjects.length > 0" class="unified-projects-section">
            <div v-for="project in userProjects" :key="project.id"
              :class="['unified-project-card', { 'current': project.id === currentProjectId }]">
              <!-- Project Header -->
              <div class="project-header">
                <div class="project-main-info">
                  <div class="project-title-section">
                    <h4 class="project-name">{{ project.name || $t('unnamedProject') }}</h4>
                    <p class="project-location">{{ project.location || $t('locationNotSet') }}</p>
                  </div>
                  <div class="project-status-badges">
                    <span class="project-status" :class="project.status">{{ $t(project.status) || $t('active') }}</span>
                    <span v-if="project.approvalStatus === 'pending'" class="approval-status-badge pending">{{ $t('pendingApproval') }}</span>
                    <span v-else-if="project.approvalStatus === 'approved'" class="approval-status-badge approved">{{ $t('approved') }}</span>
                    <span v-if="project.id === currentProjectId" class="current-badge">{{ $t('currentBadge') }}</span>
                  </div>
                </div>
                <div class="project-role-info">
                  <span class="project-unit">{{ $t('unit') }} {{ project.userUnit || $t('notAvailable') }}</span>
                  <span class="project-role">{{ formatRole(project.userRole) || $t('member') }}</span>
                </div>
              </div>

              <!-- Smart Mirror Integration Section -->
              <div class="smart-mirror-section">
                <div class="smart-mirror-header">
                  <div class="smart-mirror-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                      <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                      <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                    <span>{{ $t('smartHome') }}</span>
                  </div>
                  <div class="smart-mirror-status">
                    <span v-if="isProjectSmartHomeConnected(project.id)" class="status-badge connected">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </svg>
                      {{ $t('connected') }}
                    </span>
                    <span v-else class="status-badge disconnected">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" />
                        <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </svg>
                      {{ $t('notConnected') }}
                    </span>
                  </div>
                </div>

                <div v-if="isProjectSmartHomeConnected(project.id)" class="smart-mirror-connected">
                  <div class="device-summary">
                    <span class="device-count">{{ getProjectDeviceCount(project.id) }} {{ $t('devices') }}</span>
                    <span class="device-types">{{ $t('lights') }}, {{ $t('climateControl') }}, {{ $t('plugs') }}</span>
                  </div>
                  <div class="smart-mirror-actions">
                    <button @click="goToDevices" class="control-devices-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"
                          stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" />
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </svg>
                      {{ $t('controlDevices') }}
                    </button>
                    <button @click="disconnectSmartMirror(project.id)" class="disconnect-btn"
                      :disabled="disconnectingProject === project.id">
                      <svg v-if="disconnectingProject === project.id" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" xmlns="http://www.w3.org/2000/svg" class="spinning">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"
                          fill="currentColor" />
                      </svg>
                      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      {{ disconnectingProject === project.id ? $t('disconnecting') : $t('disconnect') }}
                    </button>
                  </div>
                </div>

                <div v-else class="smart-mirror-disconnected">
                  <p class="disconnected-message">{{ $t('connectSmartHomeDevices') }}</p>
                  <button @click="showLoginModal(project.id)" class="connect-smart-mirror-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                      <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                      <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                    {{ $t('connectSmartHome') }}
                  </button>
                </div>
              </div>

              <!-- Pending Approval Message -->
              <div v-if="project.approvalStatus === 'pending'" class="pending-approval-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z" fill="currentColor"/>
                </svg>
                <span>{{ $t('unitAwaitingApproval') }}</span>
              </div>

              <!-- Project Actions -->
              <div class="project-actions">
                <button 
                  v-if="project.id !== currentProjectId && project.approvalStatus !== 'pending'" 
                  @click="switchToProject(project)"
                  class="switch-project-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M3 17H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M8 3L4 7L8 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M16 13L20 17L16 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                  {{ $t('switchToThisProject') }}
                </button>
              </div>
            </div>
          </div>

          <!-- No Projects State -->
          <div v-else class="no-projects">
            <div class="no-projects-icon">🏠</div>
            <p>{{ $t('youDontHaveProjects') }}</p>
            <button @click="showAddProjectModal = true" class="add-first-project-btn">
              {{ $t('joinYourFirstProject') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Account Information Accordion -->
      <div class="accordion-section">
        <button @click="toggleAccordion('account')" class="accordion-header"
          :class="{ active: activeAccordion === 'account' }">
          <div class="accordion-title">
            <div class="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <div class="section-text">
              <h3>{{ $t('accountInformation') }}</h3>
              <p>{{ $t('accountInformationDesc') }}</p>
            </div>
          </div>
          <div class="accordion-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="accordion-content" :class="{ active: activeAccordion === 'account' }">
          <div class="info-grid">
            <div class="info-card">
              <div class="info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path
                    d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="info-content">
                <label>{{ $t('emailVerified') }}</label>
                <span class="verification-status"
                  :class="{ verified: userProfile?.emailVerified, unverified: !userProfile?.emailVerified }">
                  {{ userProfile?.emailVerified ? $t('verified') : $t('notVerified') }}
                </span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" />
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" />
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" />
                </svg>
              </div>
              <div class="info-content">
                <label>{{ $t('memberSince') }}</label>
                <span>{{ formatDate(userProfile?.createdAt) || $t('notAvailable') }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
              <div class="info-content">
                <label>{{ $t('lastUpdated') }}</label>
                <span>{{ formatDate(userProfile?.updatedAt) || $t('notAvailable') }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path
                    d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="info-content">
                <label>{{ $t('profileComplete') }}</label>
                <span class="completion-status"
                  :class="{ complete: userProfile?.isProfileComplete, incomplete: !userProfile?.isProfileComplete }">
                  {{ userProfile?.isProfileComplete ? $t('complete') : $t('incomplete') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Home Settings Accordion - Only show if current project has Smart Mirror connection -->
      <div v-if="isProjectSmartHomeConnected(currentProjectId)" class="accordion-section">
        <button @click="toggleAccordion('smartHome')" class="accordion-header"
          :class="{ active: activeAccordion === 'smartHome' }">
          <div class="accordion-title">
            <div class="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <div class="section-text">
              <h3>{{ $t('smartHomeSettings') }}</h3>
              <p>{{ $t('manageConnectedDevices') }}</p>
            </div>
          </div>
          <div class="accordion-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="accordion-content" :class="{ active: activeAccordion === 'smartHome' }">
          <div class="smart-home-settings">
            <div class="settings-card">
              <div class="settings-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
              <div class="settings-content">
                <h4>{{ $t('deviceManagement') }}</h4>
                <p>{{ $t('deviceManagementDesc') }}</p>
                <button @click="openDeviceManagementModal" class="manage-devices-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                  {{ $t('ManageDevices') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Accordion -->
      <div class="accordion-section">
        <button @click="toggleAccordion('settings')" class="accordion-header"
          :class="{ active: activeAccordion === 'settings' }">
          <div class="accordion-title">
            <div class="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5146 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01062 9.77251C4.27925 9.5799 4.48485 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="section-text">
              <h3>{{ $t('settings') }}</h3>
              <p>{{ $t('customizeExperience') }}</p>
            </div>
          </div>
          <div class="accordion-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="accordion-content" :class="{ active: activeAccordion === 'settings' }">
          <div class="settings-container">
            <!-- Language Settings -->
            <div class="settings-group">
              <div class="settings-header">
                <div class="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.2 19H19.8L21 22H23L18.5 10ZM15.88 17L17.5 12.67L19.12 17H15.88Z"
                      fill="currentColor" />
                  </svg>
                </div>
                <div class="settings-title">
                  <h4>{{ $t('language') }}</h4>
                  <p>{{ $t('choosePreferredLanguage') }}</p>
                </div>
              </div>
              <div class="settings-options">
                <div v-for="option in settingsStore.languageOptions" :key="option.value" class="option-item"
                  :class="{ active: settingsStore.currentLanguage === option.value }"
                  @click="settingsStore.setLanguage(option.value)">
                  <div class="option-flag">{{ option.flag }}</div>
                  <div class="option-label">{{ option.label }}</div>
                  <div class="option-check" v-if="settingsStore.currentLanguage === option.value">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Theme Settings - COMMENTED OUT -->
            <!-- <div class="settings-group">
              <div class="settings-header">
                <div class="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 3C7.03 3 3 7.03 3 12S7.03 21 12 21S21 16.97 21 12S16.97 3 12 3M12 19C8.13 19 5 15.87 5 12S8.13 5 12 5S19 8.13 19 12S15.87 19 12 19M12 7C9.24 7 7 9.24 7 12S9.24 17 12 17S17 14.76 17 12S14.76 7 12 7M12 15C10.34 15 9 13.66 9 12S10.34 9 12 9S15 10.34 15 12S13.66 15 12 15Z"
                      fill="currentColor" />
                  </svg>
                </div>
                <div class="settings-title">
                  <h4>{{ $t('theme') }}</h4>
                  <p>{{ $t('selectTheme') }}</p>
                </div>
              </div>
              <div class="settings-options">
                <div v-for="option in settingsStore.themeOptions" :key="option.value" class="option-item"
                  :class="{ active: settingsStore.currentTheme === option.value }"
                  @click="settingsStore.setTheme(option.value)">
                  <div class="option-icon">{{ option.icon }}</div>
                  <div class="option-label">{{ $t(option.value === 'light' ? 'lightMode' : 'darkMode') }}</div>
                  <div class="option-check" v-if="settingsStore.currentTheme === option.value">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div> -->

            <!-- Shake Detection Settings -->
            <!-- <div class="settings-group">
              <div class="settings-header">
                <div class="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 9L4 4M20 4L15 9M9 15L4 20M20 20L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                </div>
                <div class="settings-title">
                  <h4>{{ $t('shakeToOpenGate') }}</h4>
                  <p>{{ $t('shakeToOpenGateDesc') }}</p>
                </div>
              </div>

              <div class="settings-toggle">
                <div class="toggle-info">
                  <span class="toggle-label">{{ $t('enableShakeGesture') }}</span>
                  <span class="toggle-description">{{ appSettingsStore.shakeEnabled ? $t('enabled') : $t('disabled') }}</span>
                </div>
                <button 
                  class="toggle-switch" 
                  :class="{ active: appSettingsStore.shakeEnabled }"
                  @click="appSettingsStore.setShakeEnabled(!appSettingsStore.shakeEnabled)"
                >
                  <div class="toggle-slider"></div>
                </button>
              </div>
              
              <div v-if="appSettingsStore.shakeEnabled" class="settings-slider">
                <div class="slider-header">
                  <span class="slider-label">{{ $t('sensitivity') }}</span>
                  <span class="slider-value">{{ getSensitivityLabel(appSettingsStore.shakeSensitivity) }}</span>
                </div>
                <div class="slider-container">
                  <span class="slider-mark">{{ $t('moreSlider') }}</span>
                  <input 
                    type="range" 
                    min="5" 
                    max="25" 
                    step="5"
                    :value="appSettingsStore.shakeSensitivity"
                    @input="appSettingsStore.setShakeSensitivity(parseInt($event.target.value))"
                    class="slider-input"
                  />
                  <span class="slider-mark">{{ $t('lessSlider') }}</span>
                </div>
                <div class="slider-ticks">
                  <span>{{ $t('verySensitive') }}</span>
                  <span>{{ $t('normalSlider') }}</span>
                  <span>{{ $t('lessSlider') }}</span>
                  <span>{{ $t('least') }}</span>
                </div>
              </div>
            </div> -->

            <!-- Face ID / Face Verification Settings -->
            <div class="settings-group">
              <div class="settings-header">
                <div class="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="settings-title">
                  <h4>Face Verification</h4>
                  <p>Add or update your face for secure gate access</p>
                </div>
              </div>
              
              <div class="face-id-status" v-if="hasFaceVerification">
                <div class="status-badge success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Face ID Enrolled
                </div>
                <button @click="openFaceVerificationModal" class="action-btn secondary">
                  Update Face ID
                </button>
              </div>
              
              <div class="face-id-status" v-else>
                <div class="status-badge warning">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Not Set Up
                </div>
                <button @click="openFaceVerificationModal" class="action-btn primary">
                  Set Up Face Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Project Guidelines -->
      <div class="guidelines-section">
        <div class="section-header">
          <div class="section-title">
            <div class="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <div class="section-text">
              <h3>{{ $t('projectGuidelines') }}</h3>
              <p>{{ $t('projectGuidelinesDesc') }}</p>
            </div>
          </div>
          <button @click="showGuidelinesDialog = true" class="guidelines-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            {{ $t('viewGuidelines') }}
          </button>
        </div>
      </div>

      <!-- Device Key Reset Accordion -->
      <div class="accordion-section">
        <button @click="toggleAccordion('deviceKey')" class="accordion-header"
          :class="{ active: activeAccordion === 'deviceKey' }">
          <div class="accordion-title">
            <div class="section-icon device-key-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 2L19 4M19 4L15.5 7.5M19 4L17 6M15.5 7.5L13 10L15 12L10 17H7V14L12 9L14.5 11.5L15.5 7.5ZM7 14L4.18 16.82C3.39 17.61 3 18.33 3 19.05C3 20.12 3.88 21 5 21C5.72 21 6.44 20.61 7.23 19.82L10 17L7 14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="section-text">
              <h3>{{ $t('deviceKeyReset') }}</h3>
              <p>{{ $t('deviceKeyResetDesc') }}</p>
            </div>
          </div>
          <div class="accordion-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="accordion-content" :class="{ active: activeAccordion === 'deviceKey' }">
          <div class="device-key-container">
            <!-- Info message -->
            <div class="device-key-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <p>{{ $t('deviceKeyResetInfo') }}</p>
            </div>

            <!-- Latest request status -->
            <div v-if="latestDeviceKeyRequest" class="latest-request">
              <div class="request-header">
                <h4>{{ $t('latestRequest') }}</h4>
                <span class="request-status" :style="{ 
                  color: getDeviceKeyStatusDisplay(latestDeviceKeyRequest.status).color,
                  backgroundColor: getDeviceKeyStatusDisplay(latestDeviceKeyRequest.status).color + '20'
                }">
                  {{ getDeviceKeyStatusDisplay(latestDeviceKeyRequest.status).label }}
                </span>
              </div>
              <div class="request-details">
                <div class="request-info-item">
                  <span class="label">{{ $t('reason') }}:</span>
                  <span class="value">{{ latestDeviceKeyRequest.reason }}</span>
                </div>
                <div class="request-info-item">
                  <span class="label">{{ $t('requested') }}:</span>
                  <span class="value">{{ formatDeviceKeyRequestDate(latestDeviceKeyRequest.requestedAt) }}</span>
                </div>
                <div v-if="latestDeviceKeyRequest.status === 'rejected' && latestDeviceKeyRequest.adminNotes" class="request-info-item">
                  <span class="label">{{ $t('adminNotes') }}:</span>
                  <span class="value rejection-note">{{ latestDeviceKeyRequest.adminNotes }}</span>
                </div>
              </div>
            </div>

            <!-- Request form -->
            <div v-if="!hasPendingDeviceKeyRequest" class="device-key-form">
              <div class="form-group">
                <label for="resetReason">{{ $t('reasonForResetRequest') }} <span class="required">*</span></label>
                <textarea
                  id="resetReason"
                  v-model="deviceKeyResetReason"
                  :placeholder="$t('deviceKeyResetReasonPlaceholder')"
                  rows="4"
                  class="form-textarea"
                  :disabled="submittingDeviceKeyRequest"
                  @focus="handleTextareaFocus"
                  @blur="handleTextaraBlur"
                ></textarea>
                <span class="char-count" :class="{ 'over-limit': deviceKeyResetReason.length > 500 }">
                  {{ deviceKeyResetReason.length }} / 500
                </span>
              </div>
              <button 
                @click="submitDeviceKeyResetRequest" 
                class="submit-request-btn"
                :disabled="!deviceKeyResetReason.trim() || deviceKeyResetReason.length > 500 || submittingDeviceKeyRequest"
              >
                <svg v-if="!submittingDeviceKeyRequest" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 2L19 4M19 4L15.5 7.5M19 4L17 6M15.5 7.5L13 10L15 12L10 17H7V14L12 9L14.5 11.5L15.5 7.5ZM7 14L4.18 16.82C3.39 17.61 3 18.33 3 19.05C3 20.12 3.88 21 5 21C5.72 21 6.44 20.61 7.23 19.82L10 17L7 14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div v-else class="button-spinner-small"></div>
                <span>{{ submittingDeviceKeyRequest ? $t('submitting') : $t('submitRequest') }}</span>
              </button>
            </div>

            <!-- Pending request message -->
            <div v-else class="pending-request-message">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#f59e0b" stroke-width="2"/>
                <path d="M12 6V12L16 14" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <h4>{{ $t('requestPending') }}</h4>
              <p>{{ $t('deviceKeyResetPendingMessage') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Account Accordion (Apple App Store Requirement) -->
      <div class="accordion-section">
        <button @click="toggleAccordion('deleteAccount')" class="accordion-header delete-account-header"
          :class="{ active: activeAccordion === 'deleteAccount' }">
          <div class="accordion-title">
            <div class="section-icon danger-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="section-text">
              <h3>{{ $t('deleteAccount') || 'Delete Account' }}</h3>
              <p>{{ $t('deleteAccountSectionDesc') || 'Permanently remove your account' }}</p>
            </div>
          </div>
          <div class="accordion-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="accordion-content" :class="{ active: activeAccordion === 'deleteAccount' }">
          <div class="delete-account-section">
            <div class="delete-warning-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div class="warning-content">
                <h4>{{ $t('deleteAccountWarningTitle') || 'This action is permanent' }}</h4>
                <p>{{ $t('deleteAccountWarningText') || 'Once you delete your account, there is no going back. All your personal information, projects, and data will be permanently removed from our servers.' }}</p>
              </div>
            </div>
            
            <div class="delete-info-list">
              <h4>{{ $t('whatWillBeDeleted') || 'What will be deleted:' }}</h4>
              <ul>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ $t('deleteItem1') || 'Your personal information and profile data' }}
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ $t('deleteItem2') || 'Your project memberships and access' }}
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ $t('deleteItem3') || 'Your account settings and preferences' }}
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ $t('deleteItem4') || 'All associated data and history' }}
                </li>
              </ul>
            </div>

            <button @click="showDeleteAccountConfirm = true" class="delete-account-main-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ $t('deleteMyAccount') || 'Delete My Account' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <div class="compact-actions">
          <!-- <button @click="editProfile" class="compact-btn primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path
                d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ $t('editProfile') }}
          </button> -->

          <button @click="showLogoutConfirm = true" class="compact-btn secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ $t('logout') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error State (only show if there's an actual error) -->
    <div v-if="error && !loading" class="error-container">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2" />
          <path d="M15 9L9 15M9 9L15 15" stroke="#ef4444" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </div>
      <h3>Failed to Load Profile</h3>
      <p>{{ error }}</p>
      <button @click="loadProfile" class="retry-btn">Try Again</button>
    </div>

    <!-- Project Guidelines Dialog -->
    <ProjectGuidelinesDialog :isOpen="showGuidelinesDialog" @close="showGuidelinesDialog = false" />

    <!-- Edit Profile Dialog -->
    <EditProfileDialog :isOpen="showEditProfileDialog" :userProfile="userProfile" @close="showEditProfileDialog = false"
      @saved="handleProfileSaved" />

    <!-- Violations Modal -->
    <ViolationsModal :is-open="showViolationsModal" :user-id="userProfile?.id || ''"
      @close="showViolationsModal = false" @start-chat="handleViolationChat" />


    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutConfirm" class="modal-overlay" @click="showLogoutConfirm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('confirmLogout') }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ $t('confirmLogoutMessage') }}</p>
          <p class="modal-subtitle">{{ $t('logoutSubtitle') }}</p>
        </div>
        <div class="modal-actions">
          <button @click="showLogoutConfirm = false" class="cancel-btn">{{ $t('cancel') }}</button>
          <button @click="handleLogout" class="confirm-btn" :disabled="logoutLoading">
            <span v-if="logoutLoading">{{ $t('loggingOut') }}</span>
            <span v-else>{{ $t('logout') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal (Apple App Store Requirement) -->
    <div v-if="showDeleteAccountConfirm" class="modal-overlay" :class="{ 'keyboard-open': isKeyboardOpen }" @click.self="showDeleteAccountConfirm = false; deleteConfirmText = ''">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('deleteAccountTitle') }}</h3>
        </div>
        <div class="modal-body">
          <p class="modal-subtitle">{{ $t('deleteAccountWarningMessage') }}</p>
          
          <div class="delete-warning-text">
            <p><strong>{{ $t('deleteAccountFinal') }}</strong></p>
          </div>
          
          <div class="confirmation-input">
            <label>{{ $t('deleteAccountConfirmPrompt') }}</label>
            <input 
              v-model="deleteConfirmText" 
              type="text" 
              :placeholder="$t('typeDELETE')"
              class="confirm-input"
              @input="deleteConfirmText = deleteConfirmText.toUpperCase()"
              @focus="isKeyboardOpen = true"
              @blur="isKeyboardOpen = false"
            />
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteAccountConfirm = false; deleteConfirmText = ''; isKeyboardOpen = false" class="cancel-btn">
            {{ $t('cancel') }}
          </button>
          <button 
            @click="handleDeleteAccount" 
            class="confirm-btn delete-confirm-btn" 
            :disabled="deleteAccountLoading || deleteConfirmText !== 'DELETE'"
          >
            <span v-if="deleteAccountLoading">{{ $t('deleting') }}...</span>
            <span v-else>{{ $t('deleteMyAccount') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Project Modal -->
    <div v-if="showAddProjectModal" class="modal-overlay" @click="showAddProjectModal = false">
      <div class="modal-content add-project-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('joinExistingProject') }}</h3>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addNewProject" class="add-project-form">
            <div class="form-group">
              <label for="projectSelection">{{ $t('selectProject') }}</label>
              <select id="projectSelection" v-model="newProject.projectId" required @change="onProjectChange"
                :disabled="loadingAvailableProjects">
                <option value="">
                  {{ loadingAvailableProjects ? $t('loadingProjects') : $t('chooseProjectToJoin') }}
                </option>
                <option v-for="project in availableProjects" :key="project.id" :value="project.id">
                  {{ project.name }} - {{ project.location }}
                </option>
              </select>
              <div v-if="loadingAvailableProjects" class="loading-indicator">
                <div class="loading-dots">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <SearchableUnitDropdown
                v-model="newProject.userUnit"
                :project-id="newProject.projectId"
                :project-users="profileProjectUsers"
                :label="$t('yourUnit')"
                :placeholder="$t('selectYourUnit')"
                :search-placeholder="$t('searchUnits')"
                :disabled="!newProject.projectId"
              />
            </div>

            <div class="form-group">
              <label for="userRole">{{ $t('yourRole') }}</label>
              <select id="userRole" v-model="newProject.userRole" required>
                <option value="">{{ $t('selectYourRole') }}</option>
                <option value="owner">{{ $t('owner') }}</option>
                <option value="family">{{ $t('familyMember') }}</option>
              </select>
            </div>
          </form>
        </div>
        <!-- Success State -->
        <div v-if="projectJoinSuccess" class="success-state">
          <div class="success-icon">✅</div>
          <h3>{{ $t('successfullyJoinedProject') }}</h3>
          <p>{{ $t('canAccessNewProject') }}</p>
        </div>

        <!-- Form Actions -->
        <div v-else class="modal-actions">
          <button @click="showAddProjectModal = false" class="cancel-btn">{{ $t('cancel') }}</button>
          <button @click="addNewProject" class="confirm-btn" :disabled="addProjectLoading || !newProject.projectId">
            <span v-if="addProjectLoading">{{ $t('joiningProject') }}</span>
            <span v-else>{{ $t('joinProject') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Smart Mirror Login Modal -->
    <Teleport to="body">
      <div v-if="showLoginModalFlag" class="modal-overlay" @click="closeLoginModal">
        <div class="modal-content" @click.stop>
          <!-- Modal Header with Icon -->
          <div class="modal-header">
            <div class="header-content">
              <div class="header-text">
                <h3>{{ $t('connectSmartHomeAccount') }}</h3>
                <p>{{ $t('linkSmartHomeDevices') }} {{userProjects.find(p => p.id === selectedProjectId)?.name || $t('thisProject') }}</p>
              </div>
            </div>
            <button class="close-btn" @click="closeLoginModal" :disabled="smartMirrorStore.isConnecting">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <!-- Project Selection Card -->
          <div class="project-selection-card">
            <div class="project-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9 22V12H15V22" stroke="#AF1E23" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <div class="project-details">
              <h4>{{userProjects.find(p => p.id === selectedProjectId)?.name || 'Selected Project'}}</h4>
              <div v-if="isProjectSmartHomeConnected(selectedProjectId)" class="existing-connection">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
                <span>Already connected to a different account</span>
              </div>
            </div>
          </div>

          <!-- Login Form -->
          <div class="modal-body">
            <form @submit.prevent="handleLogin" class="login-form">
              <div class="form-group">
                <label for="email">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                  Email Address
                </label>
                <div class="input-wrapper">
                  <input id="email" v-model="loginForm.email" type="email" placeholder="Enter your Smart Home email"
                    required :disabled="smartMirrorStore.isConnecting" autocomplete="email" />
                  <div class="input-focus-indicator"></div>
                </div>
              </div>

              <div class="form-group">
                <label for="password">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                    <circle cx="12" cy="16" r="1" fill="currentColor" />
                    <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                  Password
                </label>
                <div class="input-wrapper">
                  <input id="password" v-model="loginForm.password" type="password"
                    placeholder="Enter your Smart Home password" required :disabled="smartMirrorStore.isConnecting"
                    autocomplete="current-password" />
                  <div class="input-focus-indicator"></div>
                </div>
              </div>

              <div v-if="smartMirrorStore.connectionError" class="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" />
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" />
                </svg>
                {{ smartMirrorStore.connectionError }}
              </div>
            </form>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button @click="closeLoginModal" class="cancel-btn" :disabled="smartMirrorStore.isConnecting" type="button">
              {{ $t('cancel') }}
            </button>
            <button @click="handleLogin" class="connect-btn"
              :disabled="smartMirrorStore.isConnecting || !loginForm.email || !loginForm.password" type="submit">
              <span v-if="smartMirrorStore.isConnecting">Connecting...</span>
              <span v-else>Connect</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Device Management Modal -->
    <Teleport to="body">
      <div v-if="showDeviceManagementModal" class="modal-overlay" @click="closeDeviceManagementModal">
        <div class="modal-content device-management-modal" @click.stop>
          <div class="modal-header">
            <h3>{{ $t('manageHomePageDevices') }}</h3>
            <p>{{ $t('deviceManagementDesc') }}</p>
          </div>

          <div class="modal-body">
            <!-- Device Categories -->
            <div class="device-categories">
              <!-- Dynamic Device Categories -->
              <div v-for="(categoryDevices, categoryType) in filteredGroupedDevices" :key="categoryType"
                class="device-category">
                <div class="category-header">
                  <div :class="['category-icon', categoryType]">
                    <svg :width="20" :height="20" :viewBox="getCategoryIcon(categoryType).viewBox" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path v-for="(path, index) in getCategoryIcon(categoryType).paths" :key="index" :d="path.d"
                        :stroke="path.stroke || 'currentColor'" :stroke-width="path.strokeWidth || '2'"
                        :stroke-linecap="path.strokeLinecap || 'round'"
                        :stroke-linejoin="path.strokeLinejoin || 'round'" :fill="path.fill" />
                    </svg>
                  </div>
                  <div class="category-info">
                    <h4>{{ getCategoryName(categoryType) }}</h4>
                    <span class="device-count">{{ categoryDevices.length }} devices</span>
                  </div>
                </div>
                <div class="device-list">
                  <div v-for="device in categoryDevices" :key="device.id" class="device-item">
                    <div class="device-info">
                      <div class="device-name">{{ device.name }}</div>
                      <div class="device-room">{{ device.roomName || 'Unknown Room' }}</div>
                      <div class="device-type">{{ device.type }}</div>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox"
                        :checked="selectedDevices[categoryType] && selectedDevices[categoryType].includes(device.id)"
                        @change="toggleDevice(categoryType, device.id, $event.target.checked)">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Devices Message -->
            <div v-if="totalDevices === 0" class="no-devices-message">
              <div class="no-devices-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
              <h4>{{ $t('noDevicesAvailable') }}</h4>
              <p>{{ $t('noSmartHomeDevicesConnected') }}</p>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="closeDeviceManagementModal" class="cancel-btn">{{ $t('cancel') }}</button>
            <button @click="saveDeviceSettings" class="save-btn" :disabled="savingSettings">
              <svg v-if="savingSettings" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg" class="spinning">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"
                  fill="currentColor" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              {{ savingSettings ? $t('saving') : $t('save') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Upload Documents Modal -->
    <div v-if="showUploadDocumentsModal" class="modal-overlay" @click="showUploadDocumentsModal = false">
      <div class="modal-content upload-documents-modal" @click.stop>
        <div class="modal-header">
          <h3>Upload Documents</h3>
          <button @click="showUploadDocumentsModal = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-subtitle">Upload your profile picture and ID documents. All images will be uploaded to AWS S3.</p>
          
          <!-- Profile Picture Upload -->
          <div class="upload-section">
            <label class="upload-label">
              <span class="label-text">Profile Picture</span>
              <span v-if="userProfile?.documents?.profilePictureUrl" class="label-status uploaded">✓ Uploaded</span>
              <span v-else class="label-status missing">Required</span>
            </label>
            <div class="upload-area" @click="selectProfilePicture">
              <input 
                ref="profilePictureInput" 
                type="file" 
                accept="image/*" 
                @change="handleProfilePictureSelect"
                style="display: none;"
              />
              <div v-if="!profilePicturePreview && !userProfile?.documents?.profilePictureUrl" class="upload-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Tap to upload</span>
              </div>
              <div v-else class="upload-preview">
                <img :src="profilePicturePreview || userProfile?.documents?.profilePictureUrl" alt="Profile Preview" class="preview-image" />
                <button v-if="profilePicturePreview" @click.stop="removeProfilePicture" class="remove-preview-btn">×</button>
              </div>
            </div>
          </div>

          <!-- Front ID Upload -->
          <div class="upload-section">
            <label class="upload-label">
              <span class="label-text">Front of National ID</span>
              <span v-if="userProfile?.documents?.frontIdUrl" class="label-status uploaded">✓ Uploaded</span>
              <span v-else class="label-status missing">Required</span>
            </label>
            <div class="upload-area" @click="selectFrontId">
              <input 
                ref="frontIdInput" 
                type="file" 
                accept="image/*" 
                @change="handleFrontIdSelect"
                style="display: none;"
              />
              <div v-if="!frontIdPreview && !userProfile?.documents?.frontIdUrl" class="upload-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Tap to upload</span>
              </div>
              <div v-else class="upload-preview">
                <img :src="frontIdPreview || userProfile?.documents?.frontIdUrl" alt="Front ID Preview" class="preview-image" />
                <button v-if="frontIdPreview" @click.stop="removeFrontId" class="remove-preview-btn">×</button>
              </div>
            </div>
          </div>

          <!-- Back ID Upload -->
          <div class="upload-section">
            <label class="upload-label">
              <span class="label-text">Back of National ID</span>
              <span v-if="userProfile?.documents?.backIdUrl" class="label-status uploaded">✓ Uploaded</span>
              <span v-else class="label-status missing">Required</span>
            </label>
            <div class="upload-area" @click="selectBackId">
              <input 
                ref="backIdInput" 
                type="file" 
                accept="image/*" 
                @change="handleBackIdSelect"
                style="display: none;"
              />
              <div v-if="!backIdPreview && !userProfile?.documents?.backIdUrl" class="upload-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Tap to upload</span>
              </div>
              <div v-else class="upload-preview">
                <img :src="backIdPreview || userProfile?.documents?.backIdUrl" alt="Back ID Preview" class="preview-image" />
                <button v-if="backIdPreview" @click.stop="removeBackId" class="remove-preview-btn">×</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showUploadDocumentsModal = false" class="cancel-btn" :disabled="uploadDocumentsLoading">{{ $t('cancel') }}</button>
          <button @click="uploadDocuments" class="confirm-btn" :disabled="uploadDocumentsLoading || (!profilePictureFile && !frontIdFile && !backIdFile)">
            <span v-if="uploadDocumentsLoading">
              <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/>
              </svg>
              Uploading...
            </span>
            <span v-else>Upload Documents</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import optimizedAuthService from '../../services/optimizedAuthService'
import firestoreService from '../../services/firestoreService'
import { smartMirrorService } from '../../services/smartMirrorService'
import { useNotificationStore } from '../../stores/notifications'
import { useProjectStore } from '../../stores/projectStore'
import { useSmartMirrorStore } from '../../stores/smartMirrorStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useAppSettingsStore } from '../../stores/appSettings'
import { useModalState } from '../../composables/useModalState'
import { useFormKeyboard } from '../../composables/useFormKeyboard'
import { useDateFormat } from '../../composables/useDateFormat'
import ProjectGuidelinesDialog from '../../components/ProjectGuidelinesDialog.vue'
import EditProfileDialog from '../../components/EditProfileDialog.vue'
import ViolationsModal from '../../components/ViolationsModal.vue'
import SearchableUnitDropdown from '../../components/SearchableUnitDropdown.vue'
import { getUserFines } from '../../services/finesService'
import complaintService from '../../services/complaintService'
import deviceKeyResetService from '../../services/deviceKeyResetService'

// Component name for ESLint
defineOptions({
  name: 'ProfilePage'
})

// Setup keyboard handling for better mobile UX
useFormKeyboard({
  scrollToInput: true,
  hideOnBackdropClick: true,
  scrollOffset: 150
})

const router = useRouter()
const { t } = useI18n()
const notificationStore = useNotificationStore()
const projectStore = useProjectStore()
const smartMirrorStore = useSmartMirrorStore()
const settingsStore = useSettingsStore()
const appSettingsStore = useAppSettingsStore()
const { openModal, closeModal } = useModalState()
const { formatDate, formatDateTime } = useDateFormat()

// Get sensitivity label with translation
// const getSensitivityLabel = (value) => {
//   if (value <= 10) return t('verySensitive')
//   if (value <= 15) return t('normal')
//   if (value <= 20) return t('lessSensitive')
//   return t('least')
// }

// Reactive state
const loading = ref(false) // Start as false, will be set to true only if we need to fetch data
const error = ref(null)
const userProfile = ref({}) // Initialize as empty object to ensure reactivity
const showLogoutConfirm = ref(false)
const logoutLoading = ref(false)
const showGuidelinesDialog = ref(false)
const showEditProfileDialog = ref(false)
const showAddProjectModal = ref(false)
const addProjectLoading = ref(false)
const projectJoinSuccess = ref(false)

// Document upload state
const showUploadDocumentsModal = ref(false)
const uploadDocumentsLoading = ref(false)
const profilePictureFile = ref(null)
const frontIdFile = ref(null)
const backIdFile = ref(null)
const profilePicturePreview = ref(null)
const frontIdPreview = ref(null)
const backIdPreview = ref(null)

// Delete account state (Apple App Store Requirement)
const showDeleteAccountConfirm = ref(false)
const deleteAccountLoading = ref(false)
const deleteConfirmText = ref('')
const isKeyboardOpen = ref(false)

// New project form data
const newProject = ref({
  projectId: '',
  userUnit: '',
  userRole: ''
})

// Available projects from Firestore
const availableProjects = ref([])
const loadingAvailableProjects = ref(false)
const profileProjectUsers = ref([]) // For determining occupied units in add project modal

// Smart Mirror modal state
const showLoginModalFlag = ref(false)
const selectedProjectId = ref(null)
const loginForm = ref({
  email: '',
  password: ''
})

// Device settings state
const showDeviceManagementModal = ref(false)
const hasFaceVerification = ref(false)
const selectedDevices = ref({
  lights: [],
  climate: [],
  plugs: []
})
const savingSettings = ref(false)

// Smart Mirror disconnect state
const disconnectingProject = ref(null)

// Device key reset state
const deviceKeyResetReason = ref('')
const submittingDeviceKeyRequest = ref(false)
const latestDeviceKeyRequest = ref(null)
const hasPendingDeviceKeyRequest = ref(false)

// Check if user has Face ID enrolled (MQTT setuserinfo; we store faceEnrolledAt and/or faceEnrollments per project)
const checkFaceVerificationStatus = () => {
  const documents = userProfile.value?.documents || {}
  const hasEnrollments =
    documents.faceEnrollments && typeof documents.faceEnrollments === 'object' && Object.keys(documents.faceEnrollments).length > 0
  hasFaceVerification.value = !!(documents.faceEnrolledAt || hasEnrollments)
}

// Navigate to Face ID enrollment/update page
const openFaceVerificationModal = () => {
  router.push('/profile/face-verification')
}

// Accordion state
const activeAccordion = ref(null) // Default to all accordions closed

// Violations state
const showViolationsModal = ref(false)
const violationStats = ref({
  total: 0,
  pending: 0,
  paid: 0,
  disputed: 0,
  cancelled: 0
})

// Complaints state
const complaintStats = ref({
  total: 0,
  open: 0,
  resolved: 0,
  closed: 0
})

// Family members state
const familyMembers = ref([])


// Computed properties
const userProjects = computed(() => projectStore.userProjects)
const currentProjectId = computed(() => projectStore.selectedProject?.id)

// Total devices count
const totalDevices = computed(() => {
  return smartMirrorStore.devices.length
})

// Group devices by type dynamically
const groupedDevices = computed(() => {
  const groups = {}
  smartMirrorStore.devices.forEach(device => {
    const categoryType = getDeviceCategory(device.type)
    if (!groups[categoryType]) {
      groups[categoryType] = []
    }
    groups[categoryType].push(device)
  })
  return groups
})

// Filtered grouped devices (only categories with devices)
const filteredGroupedDevices = computed(() => {
  const filtered = {}
  Object.entries(groupedDevices.value).forEach(([categoryType, devices]) => {
    if (devices.length > 0) {
      filtered[categoryType] = devices
    }
  })
  return filtered
})

// Cache for profile data to prevent unnecessary reloads
// Use sessionStorage to persist across component remounts
const PROFILE_CACHE_KEY = 'profilePage_cache'
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes (increased from 5)

const profileCache = {
  data: null,
  userId: null,
  timestamp: null,
  CACHE_DURATION: CACHE_DURATION,
  
  // Load from sessionStorage
  loadFromStorage() {
    try {
      const stored = sessionStorage.getItem(PROFILE_CACHE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const now = Date.now()
        if (parsed.data && parsed.userId && parsed.timestamp && 
            (now - parsed.timestamp) < this.CACHE_DURATION) {
          this.data = parsed.data
          this.userId = parsed.userId
          this.timestamp = parsed.timestamp
          return true
        } else {
          // Cache expired, clear it
          sessionStorage.removeItem(PROFILE_CACHE_KEY)
        }
      }
    } catch (e) {
      console.warn('ProfilePage: Error loading cache from sessionStorage:', e)
    }
    return false
  },
  
  // Save to sessionStorage
  saveToStorage() {
    try {
      if (this.data && this.userId && this.timestamp) {
        sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
          data: this.data,
          userId: this.userId,
          timestamp: this.timestamp
        }))
      }
    } catch (e) {
      console.warn('ProfilePage: Error saving cache to sessionStorage:', e)
    }
  },
  
  // Clear cache
  clear() {
    this.data = null
    this.userId = null
    this.timestamp = null
    try {
      sessionStorage.removeItem(PROFILE_CACHE_KEY)
    } catch {
      // Ignore
    }
  }
}

// Load cache from sessionStorage on initialization
profileCache.loadFromStorage()

// Load user profile from Firestore
const loadProfile = async (forceReload = false) => {
  try {
    const currentUser = await optimizedAuthService.getCurrentUser()
    if (!currentUser) {
      error.value = 'No authenticated user found'
      loading.value = false
      return
    }

    // Fast path: Check if profile is already loaded and valid
    if (!forceReload && userProfile.value?.id && userProfile.value.id === currentUser.uid) {
      console.log('ProfilePage: Profile already loaded, skipping reload')
      loading.value = false
      return
    }

    // Check sessionStorage cache first (fastest)
    if (!forceReload) {
      profileCache.loadFromStorage()
      const now = Date.now()
      const isCacheValid = profileCache.data && 
                          profileCache.userId === currentUser.uid &&
                          profileCache.timestamp &&
                          (now - profileCache.timestamp) < profileCache.CACHE_DURATION

      if (isCacheValid) {
        console.log('ProfilePage: Using cached profile data (cached', Math.round((now - profileCache.timestamp) / 1000), 'seconds ago)')
        userProfile.value = profileCache.data
        loading.value = false
        error.value = null
        checkFaceVerificationStatus()
        return // Exit early - no need to fetch
      }
    }

    // Check if we have preloaded profile data from boot file (window.__profileCache)
    if (!forceReload && window.__profileCache) {
      const preloadedCache = window.__profileCache
      const now = Date.now()
      const isPreloadValid = preloadedCache.data && 
                            preloadedCache.userId === currentUser.uid &&
                            preloadedCache.timestamp &&
                            (now - preloadedCache.timestamp) < profileCache.CACHE_DURATION
      
      if (isPreloadValid) {
        console.log('ProfilePage: Using preloaded profile data from boot file')
        // Convert DynamoDB user data to profile format
        const profileData = preloadedCache.data
        const profileObj = {
          id: profileData.id,
          email: profileData.email || currentUser.email || '',
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          fullName: profileData.fullName || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || '',
          mobile: profileData.mobile || '',
          dateOfBirth: profileData.dateOfBirth || null,
          gender: profileData.gender || null,
          nationalId: profileData.nationalId || '',
          accountType: profileData.accountType || '',
          approvalStatus: profileData.approvalStatus || '',
          registrationStatus: profileData.registrationStatus || '',
          isProfileComplete: profileData.isProfileComplete !== undefined ? profileData.isProfileComplete : false,
          emailVerified: profileData.emailVerified !== undefined ? profileData.emailVerified : false,
          unit: profileData.unit || '',
          projects: profileData.projects || [],
          documents: profileData.documents || {},
          createdAt: profileData.createdAt || null,
          updatedAt: profileData.updatedAt || null,
          authUid: currentUser.uid
        }
        // Update local cache (both in-memory and sessionStorage)
        userProfile.value = profileObj
        profileCache.data = profileObj
        profileCache.userId = currentUser.uid
        profileCache.timestamp = preloadedCache.timestamp
        profileCache.saveToStorage() // Persist to sessionStorage
        loading.value = false
        error.value = null
        return
      }
    }

    // Check if we have cached data for this user BEFORE setting loading state
    const now = Date.now()
    const isCacheValid = profileCache.data && 
                        profileCache.userId === currentUser.uid &&
                        profileCache.timestamp &&
                        (now - profileCache.timestamp) < profileCache.CACHE_DURATION

    if (!forceReload && isCacheValid) {
      console.log('ProfilePage: Using cached profile data (cached', Math.round((now - profileCache.timestamp) / 1000), 'seconds ago)')
      userProfile.value = profileCache.data
      loading.value = false // Set to false immediately when using cache
      error.value = null
      return
    }

    // Only show loading if we need to fetch from Firebase
    loading.value = true
    error.value = null

    console.log('ProfilePage: Loading profile for user (Cognito UID):', currentUser.uid)
    
    // Get email from various possible locations in the Cognito user object
    const cognitoAttrs = currentUser.cognitoAttributes || currentUser.attributes || {}
    const userEmail = currentUser.email || cognitoAttrs.email || cognitoAttrs.Email || null
    
    console.log('ProfilePage: User email from Cognito login:', userEmail)
    console.log('ProfilePage: Cognito user object structure:', {
      hasEmail: !!currentUser.email,
      hasCognitoAttributes: !!currentUser.cognitoAttributes,
      hasAttributes: !!currentUser.attributes,
      cognitoAttributesEmail: cognitoAttrs.email,
      attributesEmail: currentUser.attributes?.email,
      allKeys: Object.keys(currentUser)
    })
    
    let profileData = null
    let matchedUserId = null
    
    // Use Cognito sub (primary key) first - this is the most reliable lookup
    // The user's ID in DynamoDB is the Cognito sub
    const cognitoSub = currentUser.attributes?.sub || currentUser.cognitoAttributes?.sub || currentUser.uid
    console.log('🔍 ProfilePage: Starting user lookup process')
    console.log('🔍 ProfilePage: Cognito sub (ID):', cognitoSub)
    console.log('🔍 ProfilePage: Cognito email:', userEmail)
    console.log('🔍 ProfilePage: Cognito UID:', currentUser.uid)
    
    // Always try to fetch from DynamoDB - don't skip based on credentials check
    // The DynamoDB client will handle credential errors gracefully
    try {
      const { getUserByEmail, getUserById } = await import('src/services/dynamoDBUsersService')
      
      // First, try by ID (Cognito sub) - this is the primary key and most reliable
      if (cognitoSub) {
        console.log('🔍 ProfilePage: Trying getUserById with Cognito sub:', cognitoSub)
        const userById = await getUserById(cognitoSub)
        console.log('🔍 ProfilePage: getUserById returned:', userById)
        
        if (userById) {
          profileData = userById
          matchedUserId = userById.id
          console.log('✅ ProfilePage: SUCCESS - Found user by ID (Cognito sub) in DynamoDB users table')
          console.log('✅ ProfilePage: User data from DynamoDB (via ID):', {
            dynamoDbUserId: userById.id,
            cognitoUid: currentUser.uid,
            email: userById.email,
            fullName: userById.fullName,
            firstName: userById.firstName,
            lastName: userById.lastName,
            mobile: userById.mobile,
            dateOfBirth: userById.dateOfBirth,
            gender: userById.gender,
            nationalId: userById.nationalId,
            accountType: userById.accountType,
            approvalStatus: userById.approvalStatus,
            registrationStatus: userById.registrationStatus,
            isProfileComplete: userById.isProfileComplete,
            projects: userById.projects?.length || 0,
            unit: userById.unit,
            allFields: Object.keys(userById)
          })
        }
      }
      
      // Fallback: If not found by ID, try by email
      if (!profileData && userEmail) {
        const loginEmail = userEmail.trim().toLowerCase()
        console.warn('⚠️ ProfilePage: User NOT found by ID, trying email lookup:', loginEmail)
        console.log('🔍 ProfilePage: Calling getUserByEmail with:', loginEmail)
        
        const userByEmail = await getUserByEmail(loginEmail)
        console.log('🔍 ProfilePage: getUserByEmail returned:', userByEmail)
        
        if (userByEmail) {
          profileData = userByEmail
          matchedUserId = userByEmail.id // Use the ID from DynamoDB users table
          console.log('✅ ProfilePage: SUCCESS - Found user by email match in DynamoDB users table')
          console.log('✅ ProfilePage: User data from DynamoDB:', {
            dynamoDbUserId: userByEmail.id,
            cognitoUid: currentUser.uid,
            email: userByEmail.email,
            emailMatch: userByEmail.email?.toLowerCase() === loginEmail,
            fullName: userByEmail.fullName,
            firstName: userByEmail.firstName,
            lastName: userByEmail.lastName,
            mobile: userByEmail.mobile,
            dateOfBirth: userByEmail.dateOfBirth,
            gender: userByEmail.gender,
            nationalId: userByEmail.nationalId,
            accountType: userByEmail.accountType,
            approvalStatus: userByEmail.approvalStatus,
            registrationStatus: userByEmail.registrationStatus,
            isProfileComplete: userByEmail.isProfileComplete,
            projects: userByEmail.projects?.length || 0,
            unit: userByEmail.unit,
            allFields: Object.keys(userByEmail)
          })
        } else {
          console.warn('⚠️ ProfilePage: User also NOT found by email')
          console.warn('⚠️ ProfilePage: Will fallback to Cognito attributes')
        }
      } else if (!profileData) {
        console.warn('⚠️ ProfilePage: User NOT found by ID and no email available')
        console.warn('⚠️ ProfilePage: Will fallback to Cognito attributes')
      }
    } catch (emailError) {
        console.error('❌ ProfilePage: ERROR fetching user by email:', emailError)
        console.error('❌ ProfilePage: Error name:', emailError.name)
        console.error('❌ ProfilePage: Error message:', emailError.message)
        console.error('❌ ProfilePage: Error code:', emailError.code)
        console.error('❌ ProfilePage: Error stack:', emailError.stack)
        
        // Check if it's a credentials error
        if (emailError.message?.includes('credentials') || 
            emailError.message?.includes('AWS') || 
            emailError.message?.includes('AccessDenied') ||
            emailError.code === 'CredentialsError' ||
            emailError.code === 'UnrecognizedClientException') {
          console.warn('⚠️ ProfilePage: AWS credentials issue detected. Check your environment variables:')
          console.warn('⚠️ ProfilePage: Required: VITE_AWS_ACCESS_KEY_ID, VITE_AWS_SECRET_ACCESS_KEY, VITE_AWS_REGION')
          console.warn('⚠️ ProfilePage: Continuing with Cognito attributes fallback...')
        } else if (emailError.message?.includes('Network') || emailError.code === 'NetworkingError') {
          console.warn('⚠️ ProfilePage: Network error connecting to DynamoDB. Check your internet connection.')
          console.warn('⚠️ ProfilePage: Continuing with Cognito attributes fallback...')
        } else {
          console.warn('⚠️ ProfilePage: DynamoDB query failed. Continuing with Cognito attributes fallback...')
          console.warn('⚠️ ProfilePage: Error details:', {
            name: emailError.name,
            message: emailError.message,
            code: emailError.code
          })
        }
        // Don't throw - allow fallback to Cognito attributes
        // This ensures the profile page still loads even if DynamoDB fails
      }
    
    // If no email available, log a warning but continue (we already tried by ID)
    if (!userEmail && !profileData) {
      console.warn('⚠️ ProfilePage: No email available from Cognito user and user not found by ID')
      console.warn('⚠️ ProfilePage: Current user object structure:', {
        uid: currentUser.uid,
        username: currentUser.username,
        hasEmail: !!currentUser.email,
        hasCognitoAttributes: !!currentUser.cognitoAttributes,
        hasAttributes: !!currentUser.attributes,
        cognitoAttributes: currentUser.cognitoAttributes,
        attributes: currentUser.attributes,
        allKeys: Object.keys(currentUser)
      })
    }
    
    // Only use users table - do not check admins table
    if (!profileData) {
      console.warn('ProfilePage: User not found in users table by email. Profile data will be created from Cognito attributes.')
      console.warn('ProfilePage: This means either:')
      console.warn('  1. User does not exist in DynamoDB users table')
      console.warn('  2. Email mismatch between Cognito and DynamoDB')
      console.warn('  3. DynamoDB query failed (check console for errors above)')
    }
    
    if (profileData) {
      // Ensure matchedUserId is set (use profileData.id if matchedUserId wasn't set)
      const userIdToUse = matchedUserId || profileData.id || currentUser.uid
      
      console.log('✅ ProfilePage: Using profile data from DynamoDB users table', {
        matchedUserId: userIdToUse,
        cognitoUid: currentUser.uid,
        email: profileData.email,
        hasAllFields: {
          firstName: !!profileData.firstName,
          lastName: !!profileData.lastName,
          mobile: !!profileData.mobile,
          dateOfBirth: !!profileData.dateOfBirth,
          gender: !!profileData.gender,
          nationalId: !!profileData.nationalId,
          unit: !!profileData.unit,
          projects: !!profileData.projects
        },
        profileDataKeys: Object.keys(profileData)
      })
      
      console.log('🔍 ProfilePage: About to assign profileData to userProfile.value')
      console.log('🔍 ProfilePage: profileData sample:', {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        mobile: profileData.mobile,
        nationalId: profileData.nationalId
      })
      
      // Normalize dateOfBirth if it exists
      let normalizedDateOfBirth = profileData.dateOfBirth
      
      // If dateOfBirth is missing or null, try to get it from Cognito attributes
      if (!normalizedDateOfBirth) {
        const cognitoAttrs = currentUser.cognitoAttributes || currentUser.attributes || {}
        console.log('🔍 ProfilePage: dateOfBirth missing from DynamoDB, checking Cognito:', {
          hasCognitoAttrs: !!cognitoAttrs,
          birthdate: cognitoAttrs.birthdate
        })
        if (cognitoAttrs.birthdate) {
          try {
            const dateStr = cognitoAttrs.birthdate
            if (typeof dateStr === 'string') {
              if (dateStr.includes('/')) {
                // DD/MM/YYYY format (e.g., "25/12/2004")
                const parts = dateStr.split('/')
                if (parts.length === 3) {
                  const [day, month, year] = parts.map(p => parseInt(p.trim()))
                  console.log('🔍 ProfilePage: Parsed DD/MM/YYYY from Cognito fallback:', { day, month, year })
                  normalizedDateOfBirth = new Date(year, month - 1, day)
                  console.log('🔍 ProfilePage: Created Date from Cognito fallback:', normalizedDateOfBirth)
                } else {
                  normalizedDateOfBirth = new Date(dateStr)
                }
              } else {
                normalizedDateOfBirth = new Date(dateStr)
              }
            } else if (dateStr instanceof Date) {
              normalizedDateOfBirth = dateStr
            }
            if (normalizedDateOfBirth && isNaN(normalizedDateOfBirth.getTime())) {
              console.warn('🔍 ProfilePage: Invalid date from Cognito fallback')
              normalizedDateOfBirth = null
            }
          } catch (err) {
            console.error('❌ ProfilePage: Error parsing birthdate from Cognito fallback:', err)
            normalizedDateOfBirth = null
          }
        }
      } else {
        // Normalize existing dateOfBirth
        if (typeof normalizedDateOfBirth === 'string') {
          try {
            // Try parsing as ISO string or other formats
            const parsed = new Date(normalizedDateOfBirth)
            if (!isNaN(parsed.getTime())) {
              normalizedDateOfBirth = parsed
            }
          } catch {
            // Keep original if parsing fails
          }
        } else if (typeof normalizedDateOfBirth === 'number') {
          // Convert numeric timestamp to Date
          normalizedDateOfBirth = normalizedDateOfBirth > 1000000000000 
            ? new Date(normalizedDateOfBirth) 
            : new Date(normalizedDateOfBirth * 1000)
        }
      }
      
      // Map ALL fields from DynamoDB users table to userProfile
      // Use the matched user ID from DynamoDB, but keep Cognito UID for auth purposes
      // Map all fields exactly as they appear in the users table
      userProfile.value = { 
        // Primary identifier from DynamoDB users table
        id: userIdToUse, // Use the ID from DynamoDB users table
        
        // All fields from users table - map directly
        accountType: profileData.accountType || '',
        approvalStatus: profileData.approvalStatus || '',
        approvedAt: profileData.approvedAt || null,
        approvedBy: profileData.approvedBy || '',
        authUid: profileData.authUid || currentUser.uid, // Keep Cognito UID for authentication
        createdAt: profileData.createdAt || null,
        createdByAdmin: profileData.createdByAdmin !== undefined ? profileData.createdByAdmin : false,
        dateOfBirth: normalizedDateOfBirth, // Already normalized above
        documents: profileData.documents || {},
        email: profileData.email || userEmail || '',
        emailVerified: profileData.emailVerified !== undefined ? profileData.emailVerified : false,
        firstName: profileData.firstName || '',
        fullName: profileData.fullName || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || '',
        gender: profileData.gender || null,
        isProfileComplete: profileData.isProfileComplete !== undefined ? profileData.isProfileComplete : false,
        isSuspended: profileData.isSuspended !== undefined ? profileData.isSuspended : false,
        isTemporary: profileData.isTemporary !== undefined ? profileData.isTemporary : false,
        lastLoginAt: profileData.lastLoginAt || null,
        lastName: profileData.lastName || '',
        mobile: profileData.mobile || '',
        nationalId: profileData.nationalId || '',
        oldId: profileData.oldId || '',
        passwordResetCount: profileData.passwordResetCount || 0,
        passwordResetSent: profileData.passwordResetSent !== undefined ? profileData.passwordResetSent : false,
        passwordResetSentAt: profileData.passwordResetSentAt || null,
        projects: profileData.projects || [],
        registrationStatus: profileData.registrationStatus || '',
        registrationStep: profileData.registrationStep || '',
        role: profileData.role || '',
        suspendedAt: profileData.suspendedAt || null,
        suspendedBy: profileData.suspendedBy || '',
        suspensionEndDate: profileData.suspensionEndDate || null,
        suspensionReason: profileData.suspensionReason || '',
        suspensionType: profileData.suspensionType || '',
        unit: profileData.unit || '',
        unsuspendedAt: profileData.unsuspendedAt || null,
        unsuspendedBy: profileData.unsuspendedBy || '',
        updatedAt: profileData.updatedAt || null
      }
      
      console.log('ProfilePage: ✅ Profile data mapped from DynamoDB users table', {
        // Identifiers
        userId: userProfile.value.id,
        authUid: userProfile.value.authUid,
        email: userProfile.value.email,
        
        // Personal Information
        fullName: userProfile.value.fullName,
        firstName: userProfile.value.firstName,
        lastName: userProfile.value.lastName,
        mobile: userProfile.value.mobile,
        dateOfBirth: userProfile.value.dateOfBirth,
        gender: userProfile.value.gender,
        nationalId: userProfile.value.nationalId,
        
        // Account Status
        accountType: userProfile.value.accountType,
        approvalStatus: userProfile.value.approvalStatus,
        registrationStatus: userProfile.value.registrationStatus,
        registrationStep: userProfile.value.registrationStep,
        role: userProfile.value.role,
        isProfileComplete: userProfile.value.isProfileComplete,
        emailVerified: userProfile.value.emailVerified,
        isSuspended: userProfile.value.isSuspended,
        isTemporary: userProfile.value.isTemporary,
        
        // Project and Unit
        unit: userProfile.value.unit,
        hasProjects: (userProfile.value.projects?.length || 0) > 0,
        projectsCount: userProfile.value.projects?.length || 0,
        
        // Additional fields
        hasDocuments: Object.keys(userProfile.value.documents || {}).length > 0,
        createdAt: userProfile.value.createdAt,
        updatedAt: userProfile.value.updatedAt,
        lastLoginAt: userProfile.value.lastLoginAt
      })
      
      // Update cache (both in-memory and sessionStorage)
      profileCache.data = userProfile.value
      profileCache.userId = currentUser.uid
      profileCache.timestamp = now
      profileCache.saveToStorage() // Persist to sessionStorage
      
      // Force reactivity update by creating a new object reference
      console.log('ProfilePage: 🔄 Forcing reactivity update for userProfile')
      const profileCopy = { ...userProfile.value }
      userProfile.value = profileCopy
      
      // Check if user has Face ID enrolled
      checkFaceVerificationStatus()
      
      console.log('✅ ProfilePage: Profile loaded and cached successfully')
      console.log('✅ ProfilePage: Complete userProfile.value object:', JSON.stringify(userProfile.value, null, 2))
      console.log('✅ ProfilePage: Key fields check:', {
        email: userProfile.value.email,
        name: userProfile.value.fullName,
        firstName: userProfile.value.firstName,
        lastName: userProfile.value.lastName,
        mobile: userProfile.value.mobile,
        nationalId: userProfile.value.nationalId,
        gender: userProfile.value.gender,
        hasDateOfBirth: !!userProfile.value.dateOfBirth,
        dateOfBirth: userProfile.value.dateOfBirth,
        dateOfBirthType: typeof userProfile.value.dateOfBirth,
        dateOfBirthFormatted: userProfile.value.dateOfBirth ? formatBirthDate(userProfile.value.dateOfBirth) : null,
        unit: userProfile.value.unit,
        hasProjects: (userProfile.value.projects?.length || 0) > 0,
        allKeys: Object.keys(userProfile.value).sort()
      })
      
      // Verify the data is actually in userProfile and reactive
      console.log('ProfilePage: 🔍 Final userProfile.value reactivity check:', {
        isObject: typeof userProfile.value === 'object',
        isNull: userProfile.value === null,
        isEmpty: Object.keys(userProfile.value || {}).length === 0,
        hasEmail: !!userProfile.value?.email,
        emailValue: userProfile.value?.email,
        hasFirstName: !!userProfile.value?.firstName,
        firstNameValue: userProfile.value?.firstName,
        hasMobile: !!userProfile.value?.mobile,
        mobileValue: userProfile.value?.mobile,
        hasNationalId: !!userProfile.value?.nationalId,
        nationalIdValue: userProfile.value?.nationalId,
        hasDateOfBirth: !!userProfile.value?.dateOfBirth,
        dateOfBirthValue: userProfile.value?.dateOfBirth,
        totalKeys: Object.keys(userProfile.value || {}).length,
        allKeys: Object.keys(userProfile.value || {})
      })

      // Verify data was actually assigned before proceeding
      if (!userProfile.value || Object.keys(userProfile.value).length === 0) {
        console.error('❌ ProfilePage: CRITICAL - userProfile.value is empty after assignment!')
        console.error('❌ ProfilePage: profileData was:', profileData)
        throw new Error('Failed to assign profile data to userProfile')
      }
      
      console.log('✅ ProfilePage: Verified userProfile.value has data:', {
        hasData: !!userProfile.value && Object.keys(userProfile.value).length > 0,
        email: userProfile.value.email,
        firstName: userProfile.value.firstName,
        keysCount: Object.keys(userProfile.value).length
      })

      // Load user projects from users table using the DynamoDB users table ID
      // The projectStore will:
      // 1. Get user from users table using the DynamoDB ID (from userProfile.value.id)
      // 2. Read the projects array from the users table
      // 3. Fetch project details from the projects table for each project
      // 4. Format them with userUnit and userRole from the projects array
      // Use the userIdToUse that was already defined above (from DynamoDB users table ID)
      console.log('ProfilePage: Loading projects for user ID:', userIdToUse)
      await projectStore.fetchUserProjects(userIdToUse)
      await fetchAvailableProjects()

      // Load family members
      await loadFamilyMembers()
      
      // Final verification that data is still there
      console.log('✅ ProfilePage: Final check - userProfile.value still has data:', {
        hasEmail: !!userProfile.value?.email,
        email: userProfile.value?.email,
        hasFirstName: !!userProfile.value?.firstName,
        firstName: userProfile.value?.firstName
      })
    } else {
      // Profile doesn't exist in either table - use Cognito attributes
      console.log('ProfilePage: Profile document does not exist in users or admins table, using Cognito attributes')
      error.value = null // Don't show error, allow user to continue
      
      // Extract data from Cognito user attributes
      const cognitoAttrs = currentUser.cognitoAttributes || currentUser.attributes || {}
      
      // Parse name (could be "FirstName LastName" or just "Name")
      let firstName = ''
      let lastName = ''
      let fullName = cognitoAttrs.name || userEmail || 'User'
      
      if (cognitoAttrs.name) {
        const nameParts = cognitoAttrs.name.trim().split(/\s+/)
        if (nameParts.length > 1) {
          firstName = nameParts[0]
          lastName = nameParts.slice(1).join(' ')
        } else {
          firstName = nameParts[0]
          lastName = ''
        }
      }
      
      // Parse birthdate (format: DD/MM/YYYY from Cognito)
      let dateOfBirth = null
      if (cognitoAttrs.birthdate) {
        try {
          const dateStr = cognitoAttrs.birthdate
          console.log('🔍 ProfilePage: Parsing birthdate from Cognito:', {
            rawValue: dateStr,
            type: typeof dateStr,
            isDate: dateStr instanceof Date
          })
          
          if (typeof dateStr === 'string') {
            if (dateStr.includes('/')) {
              // DD/MM/YYYY format (e.g., "25/12/2004")
              const parts = dateStr.split('/')
              if (parts.length === 3) {
                const [day, month, year] = parts.map(p => parseInt(p.trim()))
                console.log('🔍 ProfilePage: Parsed DD/MM/YYYY:', { day, month, year })
                dateOfBirth = new Date(year, month - 1, day)
                console.log('🔍 ProfilePage: Created Date object:', dateOfBirth)
              } else {
                console.warn('🔍 ProfilePage: Invalid date format, expected DD/MM/YYYY:', dateStr)
                dateOfBirth = new Date(dateStr)
              }
            } else {
              // Try ISO format or other string formats
              dateOfBirth = new Date(dateStr)
            }
          } else if (dateStr instanceof Date) {
            dateOfBirth = dateStr
          } else {
            dateOfBirth = new Date(dateStr)
          }
          
          if (dateOfBirth && isNaN(dateOfBirth.getTime())) {
            console.warn('🔍 ProfilePage: Invalid date after parsing:', dateOfBirth)
            dateOfBirth = null
          } else if (dateOfBirth) {
            console.log('🔍 ProfilePage: Successfully parsed birthdate:', {
              dateObject: dateOfBirth,
              formatted: formatBirthDate(dateOfBirth)
            })
          }
        } catch (err) {
          console.error('❌ ProfilePage: Error parsing birthdate from Cognito:', err, cognitoAttrs.birthdate)
          dateOfBirth = null
        }
      } else {
        console.log('🔍 ProfilePage: No birthdate in Cognito attributes')
      }
      
      // Create profile object from Cognito attributes
      userProfile.value = {
        id: currentUser.uid,
        email: cognitoAttrs.email || userEmail || '',
        firstName: firstName,
        lastName: lastName,
        fullName: fullName,
        mobile: cognitoAttrs.phoneNumber || cognitoAttrs.phone_number || '',
        gender: cognitoAttrs.gender || null,
        dateOfBirth: dateOfBirth,
        emailVerified: cognitoAttrs.emailVerified || cognitoAttrs.email_verified === 'true' || false,
        registrationStatus: 'pending',
        isProfileComplete: false,
        // Store Cognito attributes for reference
        cognitoAttributes: cognitoAttrs
      }
      
      console.log('ProfilePage: Created profile from Cognito attributes:', {
        email: userProfile.value.email,
        name: userProfile.value.fullName,
        phone: userProfile.value.mobile,
        gender: userProfile.value.gender,
        birthdate: userProfile.value.dateOfBirth,
        birthdateFormatted: userProfile.value.dateOfBirth ? formatBirthDate(userProfile.value.dateOfBirth) : null,
        cognitoBirthdate: cognitoAttrs.birthdate
      })
    }
  } catch (err) {
    console.error('ProfilePage: Error loading profile:', err)
    error.value = 'Failed to load profile. Please try again.'
  } finally {
    loading.value = false
  }
}

// Cache for violations stats
const violationsCache = {
  projectId: null,
  timestamp: null,
  CACHE_DURATION: 2 * 60 * 1000 // 2 minutes
}

const loadViolationStats = async (forceReload = false) => {
  const currentUser = await optimizedAuthService.getCurrentUser()
  if (!currentUser || !projectStore.selectedProject) return

  try {
    const now = Date.now()
    const isCacheValid = violationsCache.projectId === projectStore.selectedProject.id &&
                        violationsCache.timestamp &&
                        (now - violationsCache.timestamp) < violationsCache.CACHE_DURATION

    if (!forceReload && isCacheValid) {
      console.log('🔍 ProfilePage: Using cached violation stats')
      return
    }

    console.log('🔍 ProfilePage: Loading violation stats for user:', currentUser.uid)
    console.log('🔍 ProfilePage: Project ID:', projectStore.selectedProject.id)

    const userViolations = await getUserFines(projectStore.selectedProject.id, currentUser.uid)

    const stats = userViolations.reduce((acc, violation) => {
      acc.total++
      if (violation.status === 'issued') acc.pending++
      else if (violation.status === 'paid') acc.paid++
      else if (violation.status === 'disputed') acc.disputed++
      else if (violation.status === 'cancelled') acc.cancelled++
      return acc
    }, { total: 0, pending: 0, paid: 0, disputed: 0, cancelled: 0 })

    violationStats.value = stats
    violationsCache.projectId = projectStore.selectedProject.id
    violationsCache.timestamp = now
    console.log('🔍 Violation stats loaded and cached:', stats)
    console.log('🔍 Raw violations data:', userViolations)
  } catch (error) {
    console.error('Error loading violation stats:', error)
  }
}


// Cache for complaints stats
const complaintsCache = {
  projectId: null,
  timestamp: null,
  CACHE_DURATION: 2 * 60 * 1000 // 2 minutes
}

const loadComplaintStats = async (forceReload = false) => {
  const currentUser = await optimizedAuthService.getCurrentUser()
  if (!currentUser || !projectStore.selectedProject) return

  try {
    const now = Date.now()
    const isCacheValid = complaintsCache.projectId === projectStore.selectedProject.id &&
                        complaintsCache.timestamp &&
                        (now - complaintsCache.timestamp) < complaintsCache.CACHE_DURATION

    if (!forceReload && isCacheValid) {
      console.log('🔍 ProfilePage: Using cached complaint stats')
      return
    }

    console.log('🔍 ProfilePage: Loading complaint stats')
    const userComplaints = await complaintService.getComplaints(projectStore.selectedProject.id)

    // Filter complaints for current user
    const myComplaints = userComplaints.filter(complaint => complaint.userId === currentUser.uid)

    const stats = myComplaints.reduce((acc, complaint) => {
      acc.total++
      if (complaint.status === 'Open') acc.open++
      else if (complaint.status === 'Resolved') acc.resolved++
      else if (complaint.status === 'Closed') acc.closed++
      return acc
    }, { total: 0, open: 0, resolved: 0, closed: 0 })

    complaintStats.value = stats
    complaintsCache.projectId = projectStore.selectedProject.id
    complaintsCache.timestamp = now
    console.log('🔍 Complaint stats loaded and cached:', stats)
  } catch (error) {
    console.error('Error loading complaint stats:', error)
  }
}

// Helper function to check if parentAccountId system is being used in the app
const checkIfParentAccountIdSystemExists = async () => {
  try {
    // Quick check: sample a few users to see if any have parentAccountId
    const sampleSnapshot = await firestoreService.getDocs('users', {
      limit: 10,
      timeoutMs: 3000
    })
    
    const hasParentAccountId = sampleSnapshot.docs.some(doc => {
      const data = doc.data()
      return data.parentAccountId !== undefined && data.parentAccountId !== null
    })
    
    console.log('👨‍👩‍👧‍👦 ParentAccountId system exists:', hasParentAccountId)
    return hasParentAccountId
  } catch (error) {
    console.error('Error checking parentAccountId system:', error)
    return false // Default to unit-based fallback
  }
}

// Load family members
const loadFamilyMembers = async () => {
  const currentUser = await optimizedAuthService.getCurrentUser()
  if (!currentUser || !projectStore.selectedProject || !userProfile.value) return

  try {
    // Use DynamoDB user ID (Cognito sub) instead of currentUser.uid (which might be email)
    const currentUserId = userProfile.value.id || currentUser.attributes?.sub || currentUser.cognitoAttributes?.sub || currentUser.uid
    console.log('👨‍👩‍👧‍👦 Loading family members for user:', currentUserId)
    console.log('👨‍👩‍👧‍👦 Current user profile ID:', userProfile.value.id)
    console.log('👨‍👩‍👧‍👦 Current user Cognito UID:', currentUser.uid)

    // Get current user's unit from their projects
    const currentUserProject = userProfile.value.projects?.find(
      p => p.projectId === projectStore.selectedProject.id
    )
    const currentUserUnit = currentUserProject?.unit

    if (!currentUserUnit) {
      console.log('👨‍👩‍👧‍👦 No unit found for current user in this project')
      familyMembers.value = []
      return
    }

    // Check if parentAccountId system is being used
    const hasParentAccountId = userProfile.value.parentAccountId !== undefined && userProfile.value.parentAccountId !== null
    
    let allPotentialMembers = []
    
    if (hasParentAccountId || await checkIfParentAccountIdSystemExists()) {
      // Use parentAccountId-based system
      console.log('👨‍👩‍👧‍👦 Using parentAccountId system')
      const parentId = userProfile.value.parentAccountId || currentUserId

      // Query users who have this parent ID
      const usersSnapshot = await firestoreService.getDocs('users', {
        filters: [
          { field: 'parentAccountId', operator: '==', value: parentId }
        ],
        timeoutMs: 6000
      })

      const potentialFamilyMembers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Also get users who have current user as parent (if different from parentId)
      let childrenOfCurrentUser = []
      if (parentId !== currentUserId) {
        const childrenSnapshot = await firestoreService.getDocs('users', {
          filters: [
            { field: 'parentAccountId', operator: '==', value: currentUserId }
          ],
          timeoutMs: 6000
        })
        childrenOfCurrentUser = childrenSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      }

      // If current user is a family member (has a parent), also fetch the parent user
      let parentUser = null
      if (parentId !== currentUserId) {
        try {
          const parentDoc = await firestoreService.getDoc('users', parentId)
          if (parentDoc.exists()) {
            parentUser = {
              id: parentDoc.id,
              ...parentDoc.data()
            }
          }
        } catch (error) {
          console.error('Error fetching parent user:', error)
        }
      }

      // Combine all arrays
      allPotentialMembers = [...potentialFamilyMembers, ...childrenOfCurrentUser]
      if (parentUser) {
        allPotentialMembers.push(parentUser)
      }
    } else {
      // FALLBACK: Find all users in the same unit (no parentAccountId system)
      console.log('👨‍👩‍👧‍👦 Using unit-based fallback (no parentAccountId system)')
      
      // OPTIMIZATION: Query limited users, filter on client side
      console.log('📊 ProfilePage: Fetching users with limit for family members...')
      const { limit } = await import('firebase/firestore')
      const allUsersSnapshot = await firestoreService.getDocs('users', {
        timeoutMs: 8000,
        constraints: [limit(1000)]
      })
      console.log(`✅ ProfilePage: Fetched ${allUsersSnapshot.docs.length} users (limited)`)
      
      allPotentialMembers = allUsersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => {
          // Don't include self - use DynamoDB ID for comparison
          if (user.id === currentUserId) return false
          
          // Check if user has access to the same project and same unit
          const userProjectData = user.projects?.find(p => p.projectId === projectStore.selectedProject.id)
          if (!userProjectData) return false
          
          // Must be in the same unit
          return userProjectData.unit === currentUserUnit
        })
    }
    
    // Remove duplicates
    const uniqueMembers = allPotentialMembers.filter((user, index, self) =>
      index === self.findIndex(u => u.id === user.id)
    )

    // Filter by same unit in the same project and exclude self
    // Also ensure we have full user data (firstName, lastName, email)
    const members = await Promise.all(
      uniqueMembers
        .filter(user => {
          // Don't include self - use DynamoDB ID for comparison
          if (user.id === currentUserId) return false

          // Check if user has access to the same project and same unit
          const userProjectData = user.projects?.find(p => p.projectId === projectStore.selectedProject.id)
          if (!userProjectData) return false

          // Must be in the same unit
          if (userProjectData.unit !== currentUserUnit) return false

          // Get the role from the project data
          user.role = userProjectData.role

          return true
        })
        .map(async (user) => {
          // If user is missing critical fields (firstName, lastName, email), fetch full user data
          if (!user.firstName || !user.lastName || !user.email) {
            try {
              const { getUserById } = await import('src/services/dynamoDBUsersService')
              const fullUserData = await getUserById(user.id)
              if (fullUserData) {
                // Merge full user data with existing data (preserve role from project)
                return {
                  ...fullUserData,
                  role: user.role || fullUserData.role
                }
              }
            } catch (error) {
              console.warn('Error fetching full user data for family member:', user.id, error)
            }
          }
          return user
        })
    )

    familyMembers.value = members
    console.log('👨‍👩‍👧‍👦 Loaded family members:', members.length, members.map(m => ({
      id: m.id,
      name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Unknown',
      email: m.email || 'No email',
      role: m.role || 'Unknown'
    })))
  } catch (error) {
    console.error('Error loading family members:', error)
    familyMembers.value = []
  }
}

// Handle logout
const handleLogout = async () => {
  try {
    logoutLoading.value = true

    // Clear Smart Mirror user context before signing out
    console.log('[Logout] 🚪 Clearing Smart Mirror context before sign out')
    smartMirrorService.clearPreUserId()

    await optimizedAuthService.signOut()

    notificationStore.showSuccess('Logged out successfully')

    // Redirect to login/register page
    router.push('/onboarding')
  } catch (err) {
    console.error('Logout error:', err)
    notificationStore.showError('Failed to logout. Please try again.')
  } finally {
    logoutLoading.value = false
    showLogoutConfirm.value = false
  }
}

// Handle account deletion (SOFT DELETE - Apple App Store Requirement)
const handleDeleteAccount = async () => {
  try {
    deleteAccountLoading.value = true
    console.log('🗑️ [ProfilePage] Starting account deletion process...')

    const currentUser = await optimizedAuthService.getCurrentUser()
    if (!currentUser) {
      throw new Error('No user found')
    }

    // SOFT DELETE: Mark user as deleted instead of removing from database
    // This preserves data for compliance, audit trails, and potential recovery
    const deletionData = {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedReason: 'User requested account deletion',
      // Anonymize personal data
      firstName: 'DELETED',
      lastName: 'USER',
      mobile: 'DELETED',
      nationalId: 'DELETED',
      // Keep email for potential recovery but mark as deleted
      deletedEmail: userProfile.value.email,
      // Remove FCM token to stop notifications
      fcmToken: null,
      // Clear documents
      documents: {
        profilePictureUrl: null,
        frontIdUrl: null,
        backIdUrl: null
      },
      // Clear projects access
      projects: [],
      // Mark status
      registrationStatus: 'deleted',
      updatedAt: new Date().toISOString()
    }

    console.log('📝 [ProfilePage] Updating user document with soft delete...')
    
    // Update user document in Firestore
    await firestoreService.updateDoc(`users/${currentUser.uid}`, deletionData)

    console.log('✅ [ProfilePage] User document soft deleted')

    // Sign out the user from Firebase Auth
    console.log('🚪 [ProfilePage] Signing out user...')
    await optimizedAuthService.signOut()

    // Show success message
    notificationStore.showSuccess('Account deleted successfully')

    // Redirect to onboarding/welcome page
    console.log('↩️ [ProfilePage] Redirecting to onboarding...')
    router.push('/onboarding')

  } catch (err) {
    console.error('❌ [ProfilePage] Delete account error:', err)
    notificationStore.showError('Failed to delete account. Please try again or contact support.')
  } finally {
    deleteAccountLoading.value = false
    showDeleteAccountConfirm.value = false
    deleteConfirmText.value = ''
  }
}

// Edit profile (placeholder for future implementation)
// const editProfile = () => {
//   showEditProfileDialog.value = true
// }

const handleProfileSaved = async (updatedData) => {
  // Update the local userProfile with the new data
  if (userProfile.value) {
    Object.assign(userProfile.value, updatedData)
    
    // Get current user ID for cache update
    const currentUser = await optimizedAuthService.getCurrentUser()
    const userId = currentUser?.userSub || currentUser?.uid || userProfile.value?.id
    
    // Update cache with new data (both in-memory and sessionStorage)
    profileCache.data = userProfile.value
    profileCache.userId = userId
    profileCache.timestamp = Date.now()
    profileCache.saveToStorage() // Persist to sessionStorage
  }

  // Show success message
  notificationStore.showSuccess('Profile updated successfully!')
}

// Accordion toggle function
const toggleAccordion = (section) => {
  activeAccordion.value = activeAccordion.value === section ? null : section
}

// Project management methods
const fetchAvailableProjects = async () => {
  try {
    loadingAvailableProjects.value = true
    console.log('📊 ProfilePage: Fetching projects with limit...')
    const { limit } = await import('firebase/firestore')
    const snapshot = await firestoreService.getDocs('projects', {
      constraints: [limit(50)]
    })
    console.log(`✅ ProfilePage: Fetched ${snapshot.docs.length} projects (limited)`)

    availableProjects.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error('Error fetching available projects:', err)
    notificationStore.showError('Failed to load available projects')
  } finally {
    loadingAvailableProjects.value = false
  }
}

const addNewProject = async () => {
  const currentUser = await optimizedAuthService.getCurrentUser()
  if (!currentUser) {
    notificationStore.showError('You must be logged in to join a project')
    return
  }

  if (!newProject.value.projectId || !newProject.value.userUnit || !newProject.value.userRole) {
    notificationStore.showError('Please fill in all required fields')
    return
  }

  try {
    addProjectLoading.value = true

    // Get the selected project details
    const selectedProject = availableProjects.value.find(p => p.id === newProject.value.projectId)

    if (!selectedProject) {
      notificationStore.showError('Selected project not found')
      return
    }

    // Get the correct user ID - use Cognito sub ID (userSub or attributes.sub) instead of uid
    // uid might be the email, but the user document is stored with Cognito sub ID as the key
    const userId = currentUser.userSub || currentUser.attributes?.sub || currentUser.id || currentUser.uid
    console.log('ProfilePage: Using userId for addNewProject:', userId, 'uid was:', currentUser.uid)

    // Get current user document to add project to existing projects array
    const userDoc = await firestoreService.getDoc(`users/${userId}`)
    if (!userDoc.exists()) {
      // If not found by ID, try to get by email as fallback
      if (currentUser.uid && currentUser.uid.includes('@')) {
        console.log('ProfilePage: User not found by ID, trying email lookup...')
        const { getUserByEmail } = await import('src/services/dynamoDBUsersService')
        const userByEmail = await getUserByEmail(currentUser.uid)
        if (userByEmail) {
          console.log('ProfilePage: Found user by email, using ID:', userByEmail.id)
          // Use the actual user ID from the database
          const actualUserDoc = await firestoreService.getDoc(`users/${userByEmail.id}`)
          if (actualUserDoc.exists()) {
            const userData = actualUserDoc.data()
            const currentProjects = userData.projects || []

            // Create the project object to add to the user's projects array with pending approval status
            const newUserProject = {
              projectId: newProject.value.projectId,
              role: newProject.value.userRole,
              unit: newProject.value.userUnit,
              approvalStatus: 'pending',
              requestedAt: new Date(),
              updatedAt: new Date()
            }

            // Use DynamoDB users service for more reliable updates
            const { updateUser } = await import('src/services/dynamoDBUsersService')
            
            // Update user document with new project - preserve all existing fields
            const updatedUserData = {
              ...userData, // Preserve all existing user data
              projects: [...currentProjects, newUserProject],
              updatedAt: new Date().toISOString()
            }
            
            console.log('ProfilePage: Updating user (email fallback) with data:', {
              userId: userByEmail.id,
              currentProjectsCount: currentProjects.length,
              newProjectCount: 1,
              totalProjectsAfterUpdate: updatedUserData.projects.length
            })
            
            await updateUser(userByEmail.id, updatedUserData)

            // Create a unit request document for admin review
            const nowISO = new Date().toISOString()
            await firestoreService.addDoc('unitRequests', {
              userId: userByEmail.id,
              userName: userData.name || userData.fullName || currentUser.displayName || currentUser.email,
              userEmail: currentUser.email,
              userPhone: userData.mobile || userData.phone || '',
              projectId: newProject.value.projectId,
              projectName: selectedProject.name,
              unit: newProject.value.userUnit,
              role: newProject.value.userRole,
              status: 'pending',
              requestedAt: nowISO,
              createdAt: nowISO
            })

            notificationStore.showSuccess(`Unit request submitted for ${selectedProject.name}! Awaiting admin approval.`)

            // Show success state briefly before closing
            projectJoinSuccess.value = true
            setTimeout(() => {
              projectJoinSuccess.value = false
              showAddProjectModal.value = false
              resetNewProjectForm()
            }, 1500)

            // Refresh user's projects using the correct ID
            await projectStore.fetchUserProjects(userByEmail.id)
            return
          }
        }
      }
      notificationStore.showError('User document not found')
      return
    }

    const userData = userDoc.data()
    const currentProjects = userData.projects || []

    // Create the project object to add to the user's projects array with pending approval status
    const newUserProject = {
      projectId: newProject.value.projectId,
      role: newProject.value.userRole,
      unit: newProject.value.userUnit,
      approvalStatus: 'pending', // New field for admin approval
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Use DynamoDB users service for more reliable updates
    const { updateUser } = await import('src/services/dynamoDBUsersService')
    
    // Update user document with new project - preserve all existing fields
    // Merge the new project into the existing projects array
    const updatedUserData = {
      ...userData, // Preserve all existing user data
      projects: [...currentProjects, newUserProject],
      updatedAt: new Date().toISOString()
    }
    
    console.log('ProfilePage: Updating user with data:', {
      userId,
      currentProjectsCount: currentProjects.length,
      newProjectCount: 1,
      totalProjectsAfterUpdate: updatedUserData.projects.length
    })
    
    await updateUser(userId, updatedUserData)

    // Create a unit request document for admin review
    const nowISO = new Date().toISOString()
    await firestoreService.addDoc('unitRequests', {
      userId: userId,
      userName: userData.name || userData.fullName || currentUser.displayName || currentUser.email,
      userEmail: currentUser.email,
      userPhone: userData.mobile || userData.phone || '',
      projectId: newProject.value.projectId,
      projectName: selectedProject.name,
      unit: newProject.value.userUnit,
      role: newProject.value.userRole,
      status: 'pending',
      requestedAt: nowISO,
      createdAt: nowISO
    })

    notificationStore.showSuccess(`Unit request submitted for ${selectedProject.name}! Awaiting admin approval.`)

    // Show success state briefly before closing
    projectJoinSuccess.value = true
    setTimeout(() => {
      projectJoinSuccess.value = false
      showAddProjectModal.value = false
      resetNewProjectForm()
    }, 1500)

    // Refresh user's projects using the correct ID
    await projectStore.fetchUserProjects(userId)

  } catch (err) {
    console.error('Error joining project:', err)
    console.error('Error details:', {
      message: err?.message || 'Unknown error',
      code: err?.code,
      name: err?.name,
      stack: err?.stack,
      fullError: err
    })
    const errorMessage = err?.message || 'Failed to join project. Please try again.'
    notificationStore.showError(errorMessage)
  } finally {
    addProjectLoading.value = false
  }
}

const resetNewProjectForm = () => {
  newProject.value = {
    projectId: '',
    userUnit: '',
    userRole: ''
  }
}

// Document upload functions
const profilePictureInput = ref(null)
const frontIdInput = ref(null)
const backIdInput = ref(null)

const selectProfilePicture = () => {
  profilePictureInput.value?.click()
}

const selectFrontId = () => {
  frontIdInput.value?.click()
}

const selectBackId = () => {
  backIdInput.value?.click()
}

const handleProfilePictureSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      notificationStore.showError('Please select an image file')
      return
    }
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      notificationStore.showError('Image size must be less than 10MB')
      return
    }
    profilePictureFile.value = file
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      profilePicturePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleFrontIdSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      notificationStore.showError('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      notificationStore.showError('Image size must be less than 10MB')
      return
    }
    frontIdFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      frontIdPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleBackIdSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      notificationStore.showError('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      notificationStore.showError('Image size must be less than 10MB')
      return
    }
    backIdFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      backIdPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeProfilePicture = () => {
  profilePictureFile.value = null
  profilePicturePreview.value = null
  if (profilePictureInput.value) {
    profilePictureInput.value.value = ''
  }
}

const removeFrontId = () => {
  frontIdFile.value = null
  frontIdPreview.value = null
  if (frontIdInput.value) {
    frontIdInput.value.value = ''
  }
}

const removeBackId = () => {
  backIdFile.value = null
  backIdPreview.value = null
  if (backIdInput.value) {
    backIdInput.value.value = ''
  }
}

const uploadDocuments = async () => {
  if (!profilePictureFile.value && !frontIdFile.value && !backIdFile.value) {
    notificationStore.showError('Please select at least one document to upload')
    return
  }

  try {
    uploadDocumentsLoading.value = true

    // Get current user
    const currentUser = await optimizedAuthService.getCurrentUser()
    if (!currentUser) {
      notificationStore.showError('You must be logged in to upload documents')
      return
    }

    // Get the correct user ID - use Cognito sub ID
    const userId = currentUser.userSub || currentUser.attributes?.sub || currentUser.id || currentUser.uid
    console.log('ProfilePage: Uploading documents for user:', userId)

    // Import file upload service
    const fileUploadService = (await import('../../services/fileUploadService')).default

    // Upload documents to S3
    const uploadedDocuments = await fileUploadService.uploadUserDocuments(
      userId,
      frontIdFile.value,
      backIdFile.value,
      profilePictureFile.value
    )

    console.log('ProfilePage: Documents uploaded to S3:', uploadedDocuments)

    // Get current user document to update
    const { getUserById, updateUser } = await import('src/services/dynamoDBUsersService')
    const userData = await getUserById(userId)
    
    if (!userData) {
      notificationStore.showError('User document not found')
      return
    }

    // Update user document with new document URLs
    // The uploadUserDocuments returns: { profilePicture: url, frontId: url, backId: url }
    const updatedDocuments = {
      ...(userData.documents || {}),
      ...(uploadedDocuments.profilePicture && { profilePictureUrl: uploadedDocuments.profilePicture }),
      ...(uploadedDocuments.frontId && { frontIdUrl: uploadedDocuments.frontId }),
      ...(uploadedDocuments.backId && { backIdUrl: uploadedDocuments.backId })
    }

    const updatedUserData = {
      ...userData,
      documents: updatedDocuments,
      updatedAt: new Date().toISOString()
    }

    await updateUser(userId, updatedUserData)

    console.log('ProfilePage: User document updated with new document URLs:', updatedDocuments)

    // Update local userProfile to reflect changes - merge all at once
    userProfile.value.documents = {
      ...(userProfile.value.documents || {}),
      ...updatedDocuments
    }
    
    // Force reactivity update
    userProfile.value = { ...userProfile.value }

    // Clear file selections and previews
    profilePictureFile.value = null
    frontIdFile.value = null
    backIdFile.value = null
    profilePicturePreview.value = null
    frontIdPreview.value = null
    backIdPreview.value = null
    if (profilePictureInput.value) profilePictureInput.value.value = ''
    if (frontIdInput.value) frontIdInput.value.value = ''
    if (backIdInput.value) backIdInput.value.value = ''

    notificationStore.showSuccess('Documents uploaded successfully!')
    showUploadDocumentsModal.value = false

  } catch (err) {
    console.error('Error uploading documents:', err)
    console.error('Error details:', {
      message: err?.message || 'Unknown error',
      code: err?.code,
      name: err?.name,
      stack: err?.stack
    })
    const errorMessage = err?.message || 'Failed to upload documents. Please try again.'
    notificationStore.showError(errorMessage)
  } finally {
    uploadDocumentsLoading.value = false
  }
}

// Function to fetch users for the selected project (to determine occupied units)
const fetchProfileProjectUsers = async (projectId) => {
  if (!projectId) {
    profileProjectUsers.value = []
    return
  }

  try {
    console.log('[ProfilePage] Fetching users for project:', projectId)
    
    const { Capacitor } = await import('@capacitor/core')
    
    if (Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform()) {
      // Use Capacitor Firebase plugin for iOS
      const { FirebaseFirestore } = await import('@capacitor-firebase/firestore')
      
      const result = await FirebaseFirestore.getCollection({
        reference: 'users'
      })
      
      profileProjectUsers.value = result.documents
        .map(doc => ({
          id: doc.id,
          ...doc.data
        }))
        .filter(user => {
          if (user.projects && Array.isArray(user.projects)) {
            return user.projects.some(p => p.projectId === projectId)
          }
          return false
        })
      
      console.log('[ProfilePage] ✅ Fetched', profileProjectUsers.value.length, 'users for project via Capacitor')
    } else {
      // Use Web SDK for web/Android
      console.log('📊 ProfilePage: Fetching users with limit (Web SDK)...')
      const { limit } = await import('firebase/firestore')
      const usersSnapshot = await firestoreService.getDocs('users', {
        constraints: [limit(1000)]
      })
      console.log(`✅ ProfilePage: Fetched ${usersSnapshot.docs.length} users (limited)`)
      profileProjectUsers.value = usersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => {
          if (user.projects && Array.isArray(user.projects)) {
            return user.projects.some(p => p.projectId === projectId)
          }
          return false
        })
      
      console.log('[ProfilePage] ✅ Fetched', profileProjectUsers.value.length, 'users for project via Web SDK')
    }
  } catch (error) {
    console.error('[ProfilePage] Error fetching project users:', error)
    profileProjectUsers.value = []
  }
}

const onProjectChange = () => {
  // Reset unit and role when project changes
  newProject.value.userUnit = ''
  newProject.value.userRole = ''
  
  // Fetch users for the selected project to determine occupied units
  if (newProject.value.projectId) {
    fetchProfileProjectUsers(newProject.value.projectId)
  }
}

const switchToProject = async (project) => {
  try {
    projectStore.selectProject(project)

    // Switch Smart Mirror data to the new project
    // Note: If the project has a smart home connection, it will be switched automatically
    // If not connected, user can connect it later from the smart devices page
    const result = await smartMirrorStore.switchToProject(project.id)
    
    // Check if smart mirror switch was successful (it returns {success: true/false})
    // If it fails, it's not critical - user can still use the project
    if (result && !result.success) {
      console.warn('[ProfilePage] Smart Mirror switch failed (non-critical):', result.error)
    }

    // Redirect to home page - no toast needed, clean UX
    router.push('/home')

  } catch (err) {
    console.error('[ProfilePage] Critical error switching project:', err)
    notificationStore.showError('Failed to switch project. Please try again.')
  }
}

// Smart Mirror related methods
const isProjectSmartHomeConnected = (projectId) => {
  // Check if project has a smart home connection regardless of current project
  const status = smartMirrorStore.getProjectConnectionStatus(projectId)
  return status.isConnected && status.devicesCount > 0
}

const getProjectDeviceCount = (projectId) => {
  const status = smartMirrorStore.getProjectConnectionStatus(projectId)
  return status.devicesCount
}

const goToDevices = () => {
  router.push('/smart-devices')
}

const showLoginModal = (projectId) => {
  selectedProjectId.value = projectId
  showLoginModalFlag.value = true
  loginForm.value.email = ''
  loginForm.value.password = ''
  smartMirrorStore.clearError()
}

const closeLoginModal = () => {
  showLoginModalFlag.value = false
  selectedProjectId.value = null
  loginForm.value.email = ''
  loginForm.value.password = ''
  smartMirrorStore.clearError()
}

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password || !selectedProjectId.value) {
    notificationStore.showError('Please enter both email and password')
    return
  }

  const result = await smartMirrorStore.connect(loginForm.value.email, loginForm.value.password, selectedProjectId.value)

  if (result.success) {
    const project = userProjects.value.find(p => p.id === selectedProjectId.value)
    notificationStore.showSuccess(`Successfully connected Smart Mirror to ${project?.name}!`)
    closeLoginModal()
  } else {
    notificationStore.showError(result.error || 'Failed to connect to Smart Mirror')
  }
}

const disconnectSmartMirror = async (projectId) => {
  try {
    disconnectingProject.value = projectId

    const result = await smartMirrorStore.disconnect(projectId)

    if (result.success) {
      const project = userProjects.value.find(p => p.id === projectId)
      notificationStore.showSuccess(`Successfully disconnected Smart Mirror from ${project?.name}`)
    } else {
      notificationStore.showError(result.error || 'Failed to disconnect from Smart Mirror')
    }
  } catch (error) {
    console.error('Error disconnecting Smart Mirror:', error)
    notificationStore.showError('Failed to disconnect from Smart Mirror. Please try again.')
  } finally {
    disconnectingProject.value = null
  }
}

// Utility functions
const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return first + last || 'U'
}

const getFullName = (firstName, lastName) => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  } else if (firstName) {
    return firstName
  } else if (lastName) {
    return lastName
  }
  return 'User'
}

// const formatStatus = (status) => {
//   if (!status) return 'Unknown'

//   const statusMap = {
//     'pending': 'Pending',
//     'completed': 'Completed',
//     'verified': 'Verified'
//   }

//   return statusMap[status] || status
// }

const getStatusClass = (status) => {
  if (!status) return 'status-unknown'

  const classMap = {
    'pending': 'status-pending',
    'completed': 'status-completed',
    'verified': 'status-verified'
  }

  return classMap[status] || 'status-unknown'
}

// formatDate is now from useDateFormat composable

// Simple date formatter for birthdate (MM/DD/YYYY)
// Uses local timezone to avoid date shifting issues
const formatBirthDate = (date) => {
  if (!date) return null
  
  try {
    let dateObj
    
    // Handle different date formats
    if (date.toDate && typeof date.toDate === 'function') {
      // Firestore timestamp - extract local date components to avoid timezone issues
      const tempDate = date.toDate()
      dateObj = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate())
    } else if (typeof date === 'number') {
      // Numeric timestamp (milliseconds or seconds) - extract local date components
      const tempDate = date > 1000000000000 ? new Date(date) : new Date(date * 1000)
      dateObj = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate())
    } else if (typeof date === 'string') {
      // String date - handle DD/MM/YYYY format from Cognito
      if (date.includes('/')) {
        const parts = date.split('/')
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format from Cognito
          const [day, month, year] = parts
          dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        } else {
          // Try to parse and extract local components
          const tempDate = new Date(date)
          dateObj = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate())
        }
      } else {
        // Try ISO format or other string formats - extract local components
        const tempDate = new Date(date)
        dateObj = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate())
      }
    } else if (date instanceof Date) {
      // Extract local date components to avoid timezone issues
      dateObj = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    } else {
      return null
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return null
    }
    
    // Format as MM/DD/YYYY using local date components
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    const year = dateObj.getFullYear()
    
    return `${month}/${day}/${year}`
  } catch (err) {
    console.warn('Error formatting birthdate:', err, date)
    return null
  }
}

const formatGender = (gender) => {
  if (!gender) return null

  const genderMap = {
    'male': t('male'),
    'female': t('female'),
    'other': t('other')
  }

  return genderMap[gender] || gender
}

const formatRole = (role) => {
  if (!role || role === 'owner') return t('owner')
  if (role === 'family') return t('familyMember')

  // Default to Family Member for any other role in family context
  return t('familyMember')
}

// Device management methods
const getDeviceCategory = (deviceType) => {
  const categoryMap = {
    'light': 'lights',
    'thermostat': 'climate',
    'climate': 'climate',
    'fan': 'climate', // Map fans to climate for home page display
    'heater': 'climate',
    'ac': 'climate',
    'air_conditioner': 'climate',
    'air-conditioner': 'climate',
    'plug': 'plugs',
    'outlet': 'plugs',
    'switch': 'plugs', // Map switches to plugs for home page display
    'sensor': 'plugs', // Map sensors to plugs for home page display
    'camera': 'plugs', // Map cameras to plugs for home page display
    'door': 'plugs', // Map doors to plugs for home page display
    'window': 'plugs' // Map windows to plugs for home page display
  }
  return categoryMap[deviceType] || 'plugs' // Default to plugs instead of other
}

const getCategoryName = (categoryType) => {
  const nameMap = {
    'lights': 'Lights',
    'climate': 'Climate Control',
    'plugs': 'Smart Plugs',
    'switches': 'Switches',
    'sensors': 'Sensors',
    'cameras': 'Cameras',
    'doors': 'Doors',
    'windows': 'Windows',
    'fans': 'Fans',
    'other': 'Other Devices'
  }
  return nameMap[categoryType] || 'Other Devices'
}

const getCategoryIcon = (categoryType) => {
  const icons = {
    'lights': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M9 21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21V20H9V21Z' },
        { d: 'M12 2V4' },
        { d: 'M12 18V20' },
        { d: 'M4.22 4.22L5.64 5.64' },
        { d: 'M18.36 18.36L19.78 19.78' },
        { d: 'M1 12H3' },
        { d: 'M21 12H23' },
        { d: 'M4.22 19.78L5.64 18.36' },
        { d: 'M18.36 5.64L19.78 4.22' }
      ]
    },
    'climate': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z' },
        { d: 'M12 6V18' },
        { d: 'M8 8L6 6' },
        { d: 'M16 8L18 6' },
        { d: 'M8 16L6 18' },
        { d: 'M16 16L18 18' }
      ]
    },
    'plugs': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M2 3H22C22.5523 3 23 3.44772 23 4V18C23 18.5523 22.5523 19 22 19H2C1.44772 19 1 18.5523 1 18V4C1 3.44772 1.44772 3 2 3Z' },
        { d: 'M8 21H16' },
        { d: 'M12 17V21' }
      ]
    },
    'switches': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M3 7H21' },
        { d: 'M3 17H21' },
        { d: 'M8 3L4 7L8 11' },
        { d: 'M16 13L20 17L16 21' }
      ]
    },
    'sensors': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z' },
        { d: 'M12 6V18' },
        { d: 'M8 8L6 6' },
        { d: 'M16 8L18 6' },
        { d: 'M8 16L6 18' },
        { d: 'M16 16L18 18' }
      ]
    },
    'cameras': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z' }
      ]
    },
    'doors': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M3 21H21' },
        { d: 'M3 3H21V21H3V3Z' },
        { d: 'M9 9H15' }
      ]
    },
    'windows': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M3 3H21V21H3V3Z' },
        { d: 'M3 9H21' },
        { d: 'M3 15H21' },
        { d: 'M9 3V21' },
        { d: 'M15 3V21' }
      ]
    },
    'fans': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z' },
        { d: 'M12 6V18' },
        { d: 'M8 8L6 6' },
        { d: 'M16 8L18 6' },
        { d: 'M8 16L6 18' },
        { d: 'M16 16L18 18' }
      ]
    },
    'other': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M12 2L2 7L12 12L22 7L12 2Z' },
        { d: 'M2 17L12 22L22 17' },
        { d: 'M2 12L12 17L22 12' }
      ]
    }
  }
  return icons[categoryType] || icons['other']
}

const openDeviceManagementModal = () => {
  showDeviceManagementModal.value = true
  // Load current device settings when opening
  loadDeviceSettings()
}

const closeDeviceManagementModal = () => {
  showDeviceManagementModal.value = false
  // Reset to current settings
  loadDeviceSettings()
}

const loadDeviceSettings = () => {
  // Load current device settings from localStorage or default to all devices
  const savedSettings = localStorage.getItem(`deviceSettings_${currentProjectId.value}`)
  if (savedSettings) {
    selectedDevices.value = JSON.parse(savedSettings)
  } else {
    // Default to all devices selected for the current project
    selectedDevices.value = {
      lights: [],
      climate: [],
      plugs: []
    }
    const currentProjectDevices = smartMirrorStore.devices || []

    currentProjectDevices.forEach(device => {
      const categoryType = getDeviceCategory(device.type)
      if (!selectedDevices.value[categoryType]) {
        selectedDevices.value[categoryType] = []
      }
      selectedDevices.value[categoryType].push(device.id)
    })

    // Save the default selection
    localStorage.setItem(`deviceSettings_${currentProjectId.value}`, JSON.stringify(selectedDevices.value))
  }
}

const toggleDevice = (category, deviceId, isSelected) => {
  // Ensure the category array exists
  if (!selectedDevices.value[category]) {
    selectedDevices.value[category] = []
  }

  if (isSelected) {
    if (!selectedDevices.value[category].includes(deviceId)) {
      selectedDevices.value[category].push(deviceId)
    }
  } else {
    selectedDevices.value[category] = selectedDevices.value[category].filter(id => id !== deviceId)
  }
}

const saveDeviceSettings = async () => {
  try {
    savingSettings.value = true

    // Save settings to localStorage
    localStorage.setItem(`deviceSettings_${currentProjectId.value}`, JSON.stringify(selectedDevices.value))

    // Update Smart Mirror store with selected devices
    smartMirrorStore.setSelectedDevices(selectedDevices.value)

    notificationStore.showSuccess('Device settings saved successfully!')
    closeDeviceManagementModal()

  } catch (err) {
    console.error('Error saving device settings:', err)
    notificationStore.showError('Failed to save device settings. Please try again.')
  } finally {
    savingSettings.value = false
  }
}

const handleViolationChat = () => {
  // Navigate to violations page
  router.push('/violations')
}

const handleComplaintChat = () => {
  // Navigate to complaints page
  router.push('/complaints')
}

const handleSupport = () => {
  // Navigate to support page
  router.push('/support')
}

// Device Key Reset Methods
const loadDeviceKeyRequests = async () => {
  try {
    const currentUser = await optimizedAuthService.getCurrentUser()
    if (!currentUser) return

    // Get latest request
    const latest = await deviceKeyResetService.getLatestRequest(currentUser.uid)
    latestDeviceKeyRequest.value = latest
    
    // Check if user has pending request
    const hasPending = await deviceKeyResetService.hasPendingRequest(currentUser.uid)
    hasPendingDeviceKeyRequest.value = hasPending
    
    console.log('📝 Device key requests loaded:', { latest, hasPending })
  } catch (error) {
    console.error('❌ Error loading device key requests:', error)
  }
}

const submitDeviceKeyResetRequest = async () => {
  try {
    if (!deviceKeyResetReason.value.trim()) {
      notificationStore.showWarning('Please provide a reason for your reset request')
      return
    }

    if (deviceKeyResetReason.value.length > 500) {
      notificationStore.showWarning('Reason must be 500 characters or less')
      return
    }

    submittingDeviceKeyRequest.value = true
    const currentUser = await optimizedAuthService.getCurrentUser()
    
    if (!currentUser) {
      throw new Error('No authenticated user found')
    }

    // Get selected project ID
    const projectId = projectStore.selectedProject?.id || currentProjectId.value
    
    if (!projectId) {
      throw new Error('No project selected. Please select a project first.')
    }
    
    console.log('📝 Submitting device key reset request for project:', projectId)

    // Submit the request
    await deviceKeyResetService.submitResetRequest(
      currentUser.uid,
      deviceKeyResetReason.value,
      projectId
    )

    notificationStore.showSuccess('Device key reset request submitted successfully!')
    
    // Clear form
    deviceKeyResetReason.value = ''
    
    // Reload requests
    await loadDeviceKeyRequests()
    
  } catch (error) {
    console.error('❌ Error submitting device key reset request:', error)
    notificationStore.showError('Failed to submit request. Please try again.')
  } finally {
    submittingDeviceKeyRequest.value = false
  }
}

const getDeviceKeyStatusDisplay = (status) => {
  return deviceKeyResetService.getStatusDisplay(status)
}

// formatDeviceKeyRequestDate uses formatDateTime from useDateFormat composable
const formatDeviceKeyRequestDate = (timestamp) => {
  if (!timestamp) return '-'
  const result = formatDateTime(timestamp)
  return result || t('invalidDate')
}

// Explicit handlers for textarea focus/blur to ensure bottom nav hides on iOS
const handleTextareaFocus = () => {
  console.log('📝 Device key reset textarea focused - ensuring bottom nav is hidden')
  // Add keyboard-open class as extra safeguard for iOS
  document.body.classList.add('keyboard-open')
  // Force a reflow to ensure CSS applies immediately
  document.body.offsetHeight
}

const handleTextaraBlur = () => {
  console.log('📝 Device key reset textarea blurred')
  // Delay removal to check if another input was focused
  setTimeout(() => {
    const activeElement = document.activeElement
    const isInputFocused = 
      activeElement?.tagName === 'INPUT' ||
      activeElement?.tagName === 'TEXTAREA' ||
      activeElement?.tagName === 'SELECT' ||
      activeElement?.isContentEditable
    
    if (!isInputFocused) {
      console.log('📝 No input focused, showing bottom nav')
      document.body.classList.remove('keyboard-open')
      // Force a reflow to ensure CSS applies immediately
      document.body.offsetHeight
    } else {
      console.log('📝 Another input is focused, keeping bottom nav hidden')
    }
  }, 150)
}


// Initialize from cache immediately on mount (no loading state)
const initializeFromCache = async () => {
  const currentUser = await optimizedAuthService.getCurrentUser()
  if (!currentUser) return false

  // First try sessionStorage (persists across component remounts)
  if (!profileCache.data) {
    profileCache.loadFromStorage()
  }

  const now = Date.now()
  const isCacheValid = profileCache.data && 
                      profileCache.userId === currentUser.uid &&
                      profileCache.timestamp &&
                      (now - profileCache.timestamp) < profileCache.CACHE_DURATION

  if (isCacheValid) {
    console.log('ProfilePage: Initializing from cache instantly (no loading, cached', Math.round((now - profileCache.timestamp) / 1000), 'seconds ago)')
    userProfile.value = profileCache.data
    loading.value = false
    checkFaceVerificationStatus()
    return true // Cache was loaded
  }
  
  return false // No valid cache
}

// Load profile on component mount
onMounted(async () => {
  // Initialize settings stores (lightweight, no async)
  settingsStore.initializeSettings()
  appSettingsStore.initSettings()
  
  // Try to initialize from cache first (synchronous, no loading)
  const cacheLoaded = await initializeFromCache()
  
  // Only load profile if cache wasn't loaded
  if (!cacheLoaded && !userProfile.value?.id) {
    loadProfile() // Uses cache if available, will exit early if data exists
  }
  
  // Load these in background (non-blocking, lazy)
  // Only load stats when user actually opens those sections
  // Removed automatic loading to improve page load performance
  // loadViolationStats() 
  // loadComplaintStats()
  // loadDeviceKeyRequests() // Load on demand only
})

// Refresh profile status when component is activated (e.g., when returning from face verification page)
onActivated(() => {
  console.log('[ProfilePage] Component activated, checking face verification status...')
  // Re-check face verification status in case it was updated
  if (userProfile.value?.documents) {
    checkFaceVerificationStatus()
  } else if (userProfile.value?.id) {
    // If profile is loaded but documents might be stale, force reload
    loadProfile(true) // Force reload
  }
})

// Watch for project changes to reload stats
watch(() => projectStore.selectedProject?.id, (newProjectId, oldProjectId) => {
  if (newProjectId && newProjectId !== oldProjectId) {
    console.log('🔄 ProfilePage: Project changed, reloading stats...')
    loadViolationStats(true) // Force reload
    loadComplaintStats(true) // Force reload
  }
})

// Watch modal states to manage navigation bar visibility and background scrolling
watch(showLogoutConfirm, (isOpen) => {
  if (isOpen) {
    openModal()
    document.body.classList.add('hide-bottom-nav')
  } else {
    closeModal()
    document.body.classList.remove('hide-bottom-nav')
  }
})

watch(showAddProjectModal, (isOpen) => {
  if (isOpen) {
    openModal()
    document.body.classList.add('hide-bottom-nav')
  } else {
    closeModal()
    document.body.classList.remove('hide-bottom-nav')
  }
})

watch(() => userProfile.value?.documents, () => {
  checkFaceVerificationStatus()
}, { deep: true })

watch(showLoginModalFlag, (isOpen) => {
  if (isOpen) {
    openModal()
    document.body.classList.add('hide-bottom-nav')
  } else {
    closeModal()
    document.body.classList.remove('hide-bottom-nav')
  }
})

watch(showDeviceManagementModal, (isOpen) => {
  if (isOpen) {
    openModal()
    document.body.classList.add('hide-bottom-nav')
  } else {
    closeModal()
    document.body.classList.remove('hide-bottom-nav')
  }
})

watch(showUploadDocumentsModal, (isOpen) => {
  if (isOpen) {
    openModal()
    document.body.classList.add('hide-bottom-nav')
  } else {
    closeModal()
    document.body.classList.remove('hide-bottom-nav')
  }
})
</script>

<style scoped>
.profile-page {
  background: #fafafa;
  min-height: 100vh;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e1e5e9;
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: #F6F6F6;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(175, 30, 35, 0.2);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.profile-avatar {
  position: relative;
  flex-shrink: 0;
  width: 80px;
  height: 80px;
}

.avatar-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.avatar-initial {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: white;
  backdrop-filter: blur(10px);
}

.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #AF1E23;
}

.avatar-status.status-verified {
  background: #10b981;
  color: white;
}

.avatar-status.status-pending {
  background: #f59e0b;
  color: white;
}

.avatar-status.status-completed {
  background: #10b981;
  color: white;
}

.upload-documents-btn {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #AF1E23 0%, #dc2626 100%);
  color: white;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.4);
  transition: all 0.2s ease;
  z-index: 10;
  padding: 0;
}

.upload-documents-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(175, 30, 35, 0.5);
}

.upload-documents-btn:active {
  transform: scale(0.95);
}

.upload-documents-btn svg {
  width: 18px;
  height: 18px;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
}

.profile-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.completion-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Accordion Sections */
.accordion-section {
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.accordion-header {
  width: 100%;
  background: white;
  border: none;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

/* Mobile app - hover effects disabled */
/* .accordion-header:hover {
  background: #f9fafb;
} */

.accordion-header.active {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.accordion-title {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.accordion-title h3 {
  line-height: normal;
}

.accordion-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.accordion-arrow {
  color: #6b7280;
  transition: transform 0.2s ease;
}

.accordion-header.active .accordion-arrow {
  transform: rotate(180deg);
  color: #AF1E23;
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.accordion-content.active {
  max-height: max-content;
  padding: 24px 24px 24px 24px;
}

.join-project-section {
  padding: 20px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

/* Info Sections */
.info-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.section-title h3 {
  line-height: normal;
}

.section-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.section-text h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.section-text p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.add-project-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #AF1E23;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.2);
}

/* Mobile app - hover effects disabled */
/* .add-project-btn:hover {
  background: #991b1f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
} */

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.info-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .info-card:hover {
  border-color: #AF1E23;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.1);
  transform: translateY(-1px);
} */

.info-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-content label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.info-content span {
  display: block;
  font-size: 0.95rem;
  color: #111827;
  font-weight: 500;
  word-break: break-word;
}

.verification-status.verified,
.completion-status.complete {
  color: #10b981;
  font-weight: 600;
}

.verification-status.unverified,
.completion-status.incomplete {
  color: #ef4444;
  font-weight: 600;
}

/* Smart Home Settings */
.smart-home-settings {
  margin-top: 16px;
}

.settings-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .settings-card:hover {
  border-color: #AF1E23;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.1);
} */

.settings-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.settings-content {
  flex: 1;
}

.settings-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.settings-content p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.manage-devices-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #AF1E23;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .manage-devices-btn:hover {
  background: #991b1f;
  transform: translateY(-1px);
} */

/* Guidelines Section */
.guidelines-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.guidelines-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #AF1E23;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.2);
}

/* Mobile app - hover effects disabled */
/* .guidelines-btn:hover {
  background: #991b1f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
} */

/* Device Key Reset Section */
.device-key-icon {
  background: #AF1E23;
}

.device-key-container {
  padding: 20px;
}

.device-key-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  margin-bottom: 20px;
}

.device-key-info svg {
  flex-shrink: 0;
  color: #3b82f6;
  margin-top: 2px;
}

.device-key-info p {
  flex: 1;
  font-size: 0.875rem;
  color: #1e40af;
  line-height: 1.5;
  margin: 0;
}

.latest-request {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.request-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.request-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.request-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.request-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.request-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.request-info-item .label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.request-info-item .value {
  font-size: 0.875rem;
  color: #111827;
  line-height: 1.5;
}

.request-info-item .rejection-note {
  color: #ef4444;
  font-weight: 500;
}

.device-key-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-group .required {
  color: #ef4444;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #AF1E23;
}

.form-textarea:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 4px;
}

.char-count.over-limit {
  color: #ef4444;
  font-weight: 600;
}

.submit-request-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #AF1E23;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.2);
}

.submit-request-btn:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}

.submit-request-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.pending-request-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 20px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  gap: 12px;
}

.pending-request-message h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #92400e;
  margin: 0;
}

.pending-request-message p {
  font-size: 0.875rem;
  color: #78350f;
  margin: 0;
  line-height: 1.5;
}

.button-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Actions Section */
.actions-section {
  margin-top: 32px;
}

.compact-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.compact-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
  justify-content: center;
}

.compact-btn.primary {
  background: #AF1E23;
  color: white;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.2);
}

/* Mobile app - hover effects disabled */
/* .compact-btn.primary:hover {
  background: #991b1f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
} */

.compact-btn.secondary {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

/* Mobile app - hover effects disabled */
/* .compact-btn.secondary:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
  transform: translateY(-1px);
} */

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.action-btn {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

/* Mobile app - hover effects disabled */
/* .action-btn:hover {
  border-color: #AF1E23;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.1);
  transform: translateY(-2px);
} */

.action-btn.primary {
  border-color: #AF1E23;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
}

/* Mobile app - hover effects disabled */
/* .action-btn.primary:hover {
  background: linear-gradient(135deg, #991b1f 0%, #991b1f 100%);
  box-shadow: 0 6px 16px rgba(175, 30, 35, 0.3);
} */

/* Mobile app - hover effects disabled */
/* .action-btn.secondary:hover {
  border-color: #ef4444;
  background: #fef2f2;
} */

.btn-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-btn.secondary .btn-icon {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-content {
  flex: 1;
}

.btn-title {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.action-btn.primary .btn-title {
  color: white;
}

.btn-subtitle {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.action-btn.primary .btn-subtitle {
  color: rgba(255, 255, 255, 0.8);
}

/* Responsive Design */
@media (max-width: 768px) {

  .hero-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .compact-actions {
    gap: 8px;
    flex-direction: row-reverse;
  }

  .compact-btn {
    width: 100%;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .accordion-header {
    padding: 16px 20px;
  }

  .accordion-content.active {
    padding: 12px 12px 12px 12px;
  }

  .accordion-title {
    gap: 12px;
  }

  .accordion-actions {
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .section-title {
    gap: 12px;
  }
}

/* Error State */
.error-container {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  margin-bottom: 20px;
}

.error-container h3 {
  color: #dc3545;
  margin: 0 0 16px 0;
}

.error-container p {
  color: #666;
  margin: 0 0 24px 0;
}

.retry-btn {
  background-color: #AF1E23;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* Mobile app - hover effects disabled */
/* .retry-btn:hover {
  background-color: #991b1f;
} */

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start; /* Changed from center to flex-start */
  justify-content: center;
  z-index: 9999999 !important; /* Increased to be above bottom nav and top nav - use !important to override any conflicting styles */
  overflow-y: auto; /* Allow scrolling */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  padding: 20px 0; /* Add padding for better spacing */
  /* Ensure modal stays above bottom navigation and top navigation */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  /* Force hardware acceleration and proper stacking */
  will-change: transform;
  backface-visibility: hidden;
  /* Create new stacking context to ensure it's above everything */
  isolation: isolate;
}

.modal-content {
  background-color: #F6F6F6;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.3);
  margin: auto; /* Center vertically when there's space */
  max-height: calc(100vh - 40px); /* Prevent modal from exceeding viewport */
  overflow-y: auto; /* Allow content scrolling if needed */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  /* Ensure modal content is above bottom nav */
  position: relative;
  z-index: 1;
}

.modal-header h3 {
  margin: 0 0 16px 0;
  color: #f3e5f5 !important;
  font-weight: 600;
  font-size: 1.3rem;
}

.modal-body p {
  margin: 0 0 12px 0;
  color: #666;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: #999;
}

.modal-actions {
  display: flex;
  width: 90%;
  margin: auto;
  gap: 10px;
  margin-top: 24px;
  margin-bottom: 24px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.cancel-btn {
  background-color: #e1e5e9;
  color: #666;
}

/* Mobile app - hover effects disabled */
/* .cancel-btn:hover {
  background-color: #cbd3da;
} */

.confirm-btn {
  background-color: #dc3545;
  color: white;
}

/* Mobile app - hover effects disabled */
/* .confirm-btn:hover:not(:disabled) { ... } */

.confirm-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Add Project Modal Styles */
.add-project-modal {
  max-width: 500px;
}

.upload-documents-modal {
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.upload-documents-modal .modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.upload-documents-modal .modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.upload-documents-modal .close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  border-radius: 8px;
}

.upload-documents-modal .close-btn:hover {
  color: #374151;
  background: #f3f4f6;
}

.upload-documents-modal .modal-subtitle {
  margin: 0 0 24px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.upload-documents-modal .modal-actions{
  flex-direction: column;
  margin-top: 0;
}

.upload-section {
  margin-bottom: 24px;
}

.upload-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.label-text {
  font-size: 14px;
  font-weight: 600;
}

.label-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.label-status.uploaded {
  background: #d1fae5;
  color: #065f46;
}

.label-status.missing {
  background: #fee2e2;
  color: #991b1b;
}

.upload-area {
  position: relative;
  width: 100%;
  min-height: 200px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.upload-area:hover {
  border-color: #AF1E23;
  background: #fef2f2;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6b7280;
  padding: 40px;
  text-align: center;
}

.upload-placeholder svg {
  width: 48px;
  height: 48px;
  color: #9ca3af;
}

.upload-placeholder span {
  font-size: 14px;
  font-weight: 500;
}

.upload-preview {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
  border-radius: 12px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  min-height: 200px;
  object-fit: cover;
  border-radius: 12px;
}

.remove-preview-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  transition: all 0.2s;
  line-height: 1;
}

.remove-preview-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Success State */
.success-state {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: success-bounce 0.6s ease-out;
}

.success-state h3 {
  color: #28a745;
  margin: 0 0 16px 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.success-state p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

@keyframes success-bounce {
  0% {
    transform: scale(0);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

.add-project-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

/* Enhanced form group spacing */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group select {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: #F6F6F6;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 16px center;
  background-repeat: no-repeat;
  background-size: 20px;
  padding-right: 52px;
  min-height: 48px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
}

.form-group select:active {
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-group select:focus {
  outline: none;
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  transform: translateY(-1px);
}

.form-group
/* Mobile app - hover effects disabled */
/* select:hover {
  border-color: #AF1E23;
  background-color: #fff5f2;
} */

/* Custom dropdown options styling */
.form-group select option {
  padding: 16px 20px;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  background: #F6F6F6;
  border: none;
  transition: all 0.2s ease;
}

.form-group select
/* Mobile app - hover effects disabled */
/* option:hover {
  background-color: #fff5f2;
  color: #AF1E23;
  transform: translateX(4px);
} */

.form-group select option:checked {
  background: linear-gradient(135deg, #AF1E23, #AF1E23);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

/* Placeholder styling for select */
.form-group select:invalid {
  color: #9ca3af;
}

.form-group select:valid {
  color: #2c3e50;
}

/* Enhanced form group styling */
.form-group label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group label::before {
  content: '';
  width: 4px;
  height: 4px;
  background: #AF1E23;
  border-radius: 50%;
  display: inline-block;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* Loading indicator for project selection */
.loading-indicator {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #AF1E23;
  border-radius: 50%;
  animation: dot-bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes dot-bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {

  .info-grid {
    grid-template-columns: 1fr;
  }

  .profile-header {
    padding: 30px 16px;
  }

  .profile-name {
    font-size: 1.5rem;
  }

  .info-section {
    padding: 20px;
  }
}

/* Unified Project Cards Styles */
.unified-projects-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.unified-project-card {
  background: #F6F6F6;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  position: relative;
}

/* Mobile app - hover effects disabled */
/* .unified-project-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
} */

.unified-project-card.current {
  border-color: #AF1E23;
  background: linear-gradient(135deg, #F6F6F6 0%, #F6F6F6 100%);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.1);
}

/* Project Header */
.project-header {
  margin-bottom: 16px;
}

.project-main-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.project-title-section h4 {
  margin: 0 0 2px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
}

.project-title-section p {
  margin: 0;
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 400;
}

.project-status-badges {
  display: flex;
  gap: 6px;
  align-items: center;
}

.project-status {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.project-status.active {
  background: #dcfce7;
  color: #166534;
}

.current-badge {
  background: #AF1E23;
  color: white;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.approval-status-badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.approval-status-badge.pending {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fbbf24;
}

.approval-status-badge.approved {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.pending-approval-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  margin-top: 12px;
  font-size: 0.875rem;
  color: #92400e;
}

.pending-approval-message svg {
  flex-shrink: 0;
  color: #f59e0b;
}

.project-role-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.project-unit,
.project-role {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  background: #f9fafb;
}

/* Smart Mirror Section */
.smart-mirror-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.settings-description {
  margin-bottom: 16px;
}

.settings-description p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
}

.manage-devices-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #AF1E23;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
}

/* Mobile app - hover effects disabled */
/* .manage-devices-btn:hover {
  background: #AF1E23;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
} */

.smart-mirror-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.smart-mirror-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.smart-mirror-title svg {
  color: #AF1E23;
  width: 16px;
  height: 16px;
}

.smart-mirror-status {
  display: flex;
  align-items: center;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.connected {
  background: #dcfce7;
  color: #166534;
}

.status-badge.disconnected {
  background: #fef2f2;
  color: #dc2626;
}

.smart-mirror-connected {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-summary {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.device-count {
  font-size: 0.95rem;
  font-weight: 600;
  color: #AF1E23;
}

.device-types {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 400;
}

.smart-mirror-actions {
  display: flex;
  gap: 8px;
}

.control-devices-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #AF1E23;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .control-devices-btn:hover {
  background: #AF1E23;
  transform: translateY(-1px);
} */

.disconnect-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .disconnect-btn:hover:not(:disabled) { ... } */

.disconnect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinning {
  animation: spin 1s linear infinite;
}

.reauth-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  padding: 4px 8px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #92400e;
  font-weight: 500;
}

.reauth-warning svg {
  color: #f59e0b;
}


.smart-mirror-disconnected {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.disconnected-message {
  margin: 0;
  color: #6b7280;
  font-size: 0.8rem;
  font-weight: 400;
  line-height: 1.4;
}

.connect-smart-mirror-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #AF1E23;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

/* Mobile app - hover effects disabled */
/* .connect-smart-mirror-btn:hover {
  background: #AF1E23;
  transform: translateY(-1px);
} */

/* Project Actions */
.project-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.switch-project-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .switch-project-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  transform: translateY(-1px);
} */

/* Modal Styles (reused from SmartMirrorConnection) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start; /* Changed from center to flex-start for keyboard support */
  justify-content: center;
  z-index: 9999999; /* Increased to be above bottom nav */
  animation: fadeIn 0.3s ease-out;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 20px 0; /* Add padding for scrolling */
  overflow-y: auto; /* Allow scrolling */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  /* Ensure modal stays above bottom navigation */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  /* Force hardware acceleration and proper stacking */
  will-change: transform;
  backface-visibility: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(135deg, #F6F6F6 0%, #F6F6F6 100%);
  border-radius: 24px;
  padding: 0;
  max-width: 480px;
  width: 90%;
  max-height: calc(100vh - 40px); /* Prevent exceeding viewport with padding */
  overflow-y: auto; /* Allow content scrolling */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  margin: auto; /* Center when space available */
  transform: none;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 32px 32px 24px 32px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.header-text h3 {
  margin: 0 0 4px 0;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.header-text p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 500;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mobile app - hover effects disabled */
/* .close-btn:hover:not(:disabled) { ... } */

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.project-selection-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #F6F6F6 0%, #F6F6F6 100%);
  border-bottom: 1px solid #e2e8f0;
}

.project-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  border-radius: 12px;
  color: white;
}

.project-details h4 {
  margin: 0 0 4px 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 700;
}

.project-details p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

.existing-connection {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 10px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #92400e;
  font-weight: 500;
}

.existing-connection svg {
  color: #f59e0b;
}

.modal-body {
  padding: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
}

.input-wrapper {
  position: relative;
}

.form-group input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 500;
  background: #F6F6F6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #AF1E23;
  background: #fefefe;
  transform: translateY(-1px);
  box-shadow:
    0 0 0 4px rgba(255, 107, 53, 0.1),
    0 4px 12px rgba(255, 107, 53, 0.15);
}

.form-group input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.7;
}

.input-focus-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #AF1E23, #AF1E23);
  border-radius: 1px;
  transform: scaleX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-group input:focus+.input-focus-indicator {
  transform: scaleX(1);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid #fecaca;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-4px);
  }

  75% {
    transform: translateX(4px);
  }
}

.modal-footer {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding: 24px 32px 32px 32px;
  background: linear-gradient(135deg, #F6F6F6 0%, #F6F6F6 100%);
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 100px;
}

/* Mobile app - hover effects disabled */
/* .cancel-btn:hover:not(:disabled) { ... } */

.cancel-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

.connect-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
}

/* Mobile app - hover effects disabled */
/* .connect-btn:hover:not(:disabled) { ... } */

.connect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .unified-project-card {
    padding: 16px;
  }

  .project-main-info {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .smart-mirror-connected {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .smart-mirror-actions {
    width: 100%;
  }

  .control-devices-btn,
  .connect-smart-mirror-btn {
    width: 100%;
    justify-content: center;
  }

  .project-actions {
    justify-content: center;
  }

  .switch-project-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Device Management Modal Styles */
.device-management-modal {
  max-width: 700px;
  max-height: calc(100vh - 40px); /* Account for padding */
  width: 95%;
  background: #F6F6F6;
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
  margin: auto; /* Center when space available */
}

.device-management-modal .modal-header {
  padding: 32px 32px 24px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  flex-shrink: 0;
  position: relative;
  flex-direction: column;
}

.device-management-modal .modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.device-management-modal .modal-header h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-management-modal .modal-header h3::before {
  font-size: 20px;
}

.device-management-modal .modal-header p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  font-weight: 400;
}

.device-management-modal .modal-body {
  padding: 0;
  flex: 1;
  overflow-y: auto;
  background: #fafafa;
}

.device-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.device-category {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
}

.category-icon.lights {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
}

.category-icon.climate {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
}

.category-icon.plugs {
  background: linear-gradient(135deg, #ffab91 0%, #ffccbc 100%);
}

.category-icon.switches {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.category-icon.sensors {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.category-icon.cameras {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
}

.category-icon.doors {
  background: linear-gradient(135deg, #7c2d12 0%, #ea580c 100%);
}

.category-icon.windows {
  background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
}

.category-icon.fans {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
}

.category-icon.other {
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
}

.category-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.device-count {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F6F6F6;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .device-item:hover {
  border-color: #AF1E23;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.1);
} */

.device-info {
  flex: 1;
}

.device-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 2px 0;
}

.device-room {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0 0 2px 0;
}

.device-type {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.2s;
  border-radius: 12px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: #F6F6F6;
  transition: 0.2s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input:checked+.toggle-slider {
  background-color: #AF1E23;
  width: 98%;
  border-radius: 12px;
}

input:checked+.toggle-slider:before {
  transform: translateX(24px);
}

.no-devices-message {
  text-align: center;
  padding: 60px 32px;
  background: #F6F6F6;
  margin: 24px 32px;
  border-radius: 16px;
  border: 2px dashed #e5e7eb;
}

.no-devices-icon {
  width: 60px;
  height: 60px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #9ca3af;
}

.no-devices-message h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.no-devices-message p {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Device Management Modal Actions */
.device-management-modal .modal-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  background: white;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.device-management-modal .cancel-btn {
  flex: 1;
  padding: 16px 24px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #374151;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.device-management-modal .cancel-btn:active {
  transform: scale(0.98);
  background: #f9fafb;
  border-color: #d1d5db;
}

.device-management-modal .save-btn {
  flex: 1;
  padding: 16px 24px;
  border-radius: 12px;
  border: none;
  background: #AF1E23;
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.25);
}

.device-management-modal .save-btn:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(175, 30, 35, 0.2);
}

.device-management-modal .save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.device-management-modal .spinning {
  animation: spin 1s linear infinite;
}

/* Violations Styles */
.violations-icon {
  background: #AF1E23;
  color: #f0fdf4;
}

.violations-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.violations-summary {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
}

.violations-stats {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.violations-btn {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

/* Mobile app - hover effects disabled */
/* .violations-btn:hover {
  border-color: #AF1E23;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.1);
} */

.violations-btn-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.violations-btn-icon {
  width: 48px;
  height: 48px;
  background: #AF1E23;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f0fdf4;
  flex-shrink: 0;
  position: relative;
}

.violations-btn-text h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.violations-btn-text p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.violations-btn-arrow {
  color: #9ca3af;
  transition: transform 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .violations-btn:hover .violations-btn-arrow {
  transform: translateX(4px);
} */

.no-violations {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  gap: 16px;
}

.test-violation-btn {
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

/* Mobile app - hover effects disabled */
/* .test-violation-btn:hover {
  background: #8b161a;
  transform: translateY(-1px);
} */

.no-violations-icon {
  width: 64px;
  height: 64px;
  background: #f0fdf4;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
}

.no-violations h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.no-violations p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

/* Mobile Optimizations for Violations */
@media (max-width: 480px) {
  .violations-stats {
    gap: 12px;
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .violations-btn {
    padding: 12px;
  }

  .violations-btn-content {
    gap: 12px;
  }

  .violations-btn-icon {
    width: 40px;
    height: 40px;
  }

  .no-violations {
    padding: 30px 16px;
  }

  .no-violations-icon {
    width: 56px;
    height: 56px;
  }
}

/* Complaints Styles */
.complaints-icon {
  background: #AF1E23;
  color: #f0fdf4;
}

.complaints-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.complaints-summary {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
}

.complaints-stats {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.complaints-btn {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.complaints-btn-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.complaints-btn-icon {
  width: 48px;
  height: 48px;
  background: #AF1E23;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f0fdf4;
  flex-shrink: 0;
  position: relative;
}

.complaints-btn-text h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.complaints-btn-text p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.complaints-btn-arrow {
  color: #9ca3af;
  transition: transform 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .complaints-btn:hover .complaints-btn-arrow {
  transform: translateX(4px);
} */

/* Support Icon Styles */
.support-icon {
  background: #AF1E23;
  color: #f0fdf4;
}

.no-complaints {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  gap: 16px;
}

.no-complaints-icon {
  width: 64px;
  height: 64px;
  background: #f0fdf4;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #AF1E23;
}

.no-complaints h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.no-complaints p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

/* Mobile Optimizations for Complaints */
@media (max-width: 480px) {
  .complaints-stats {
    gap: 12px;
  }

  .complaints-btn {
    padding: 12px;
  }

  .complaints-btn-content {
    gap: 12px;
  }

  .complaints-btn-icon {
    width: 40px;
    height: 40px;
  }

  /* Support responsive styles handled by accordion styles */

  .no-complaints {
    padding: 30px 16px;
  }

  .no-complaints-icon {
    width: 56px;
    height: 56px;
  }
}


/* Notification Badges */
.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  padding: 0 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: badge-pulse 2s infinite;
}

.violations-badge {
  background: #ef4444;
}

.complaints-badge {
  background: #f59e0b;
}

@keyframes badge-pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

/* Mobile optimizations for badges */
@media (max-width: 480px) {
  .notification-badge {
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    font-size: 0.7rem;
  }
}

/* Settings Styles */
.settings-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-group {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .settings-group:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
} */

.settings-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.settings-icon {
  width: 40px;
  height: 40px;
  background: #AF1E23;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.settings-title h4 {
  margin: 0 0 4px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.settings-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.settings-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  justify-content: space-between;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

/* Mobile app - hover effects disabled */
/* .option-item:hover {
  border-color: #d1d5db;
  background: #f9fafb;
} */

.option-item.active {
  border-color: #AF1E23;
  background: #fef2f2;
}

.option-flag {
  font-size: 1.25rem;
  line-height: 1;
  flex-shrink: 0;
}

.option-icon {
  font-size: 1.25rem;
  line-height: 1;
  flex-shrink: 0;
}

.option-label {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.option-item.active .option-label {
  color: #111827;
  font-weight: 600;
}

.option-check {
  width: 20px;
  height: 20px;
  background: #AF1E23;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.option-check svg {
  width: 12px;
  height: 12px;
}

/* Toggle Switch Styles */
.settings-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 12px;
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}

.toggle-description {
  font-size: 0.75rem;
  color: #6b7280;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 28px;
  background: #e5e7eb;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  flex-shrink: 0;
}

.toggle-switch.active {
  background: #AF1E23;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(22px);
}

/* Slider Styles */
.settings-slider {
  margin-top: 16px;
  padding: 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.slider-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.slider-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: #AF1E23;
  background: #fef2f2;
  padding: 4px 12px;
  border-radius: 12px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.slider-mark {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  min-width: 35px;
  text-align: center;
}

.slider-input {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #AF1E23;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider-input::-webkit-slider-thumb:active {
  transform: scale(1.2);
  box-shadow: 0 3px 8px rgba(175, 30, 35, 0.4);
}

.slider-input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #AF1E23;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider-input::-moz-range-thumb:active {
  transform: scale(1.2);
  box-shadow: 0 3px 8px rgba(175, 30, 35, 0.4);
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
}

.slider-ticks span {
  font-size: 0.7rem;
  color: #9ca3af;
  font-weight: 500;
}

/* RTL Support for Settings */
[dir="rtl"] .settings-header {
  flex-direction: row-reverse;
}

[dir="rtl"] .option-item {
  flex-direction: row-reverse;
}

[dir="rtl"] .option-check {
  order: -1;
}

/* RTL: Fix project-main-info layout for Arabic */
[dir="rtl"] .project-main-info {
  flex-direction: row-reverse;
}

/* RTL: Fix project-header arrows for Arabic */
[dir="rtl"] .violations-btn-arrow svg,
[dir="rtl"] .complaints-btn-arrow svg {
  transform: scaleX(-1);
}

/* RTL: Flip hero content */
[dir="rtl"] .hero-content {
  flex-direction: row-reverse;
}

/* RTL: Flip accordion headers */
[dir="rtl"] .accordion-header {
  flex-direction: row-reverse;
  text-align: right;
}

/* RTL: Flip accordion title */
[dir="rtl"] .accordion-title {
  flex-direction: row-reverse;
}

/* RTL: Flip accordion arrow */
[dir="rtl"] .accordion-header.active .accordion-arrow {
  transform: rotate(-180deg);
}

/* RTL: Flip info cards */
[dir="rtl"] .info-card {
  flex-direction: row-reverse;
}

/* RTL: Flip family member cards */
[dir="rtl"] .family-member-card {
  flex-direction: row-reverse;
}

/* RTL: Flip smart mirror section */
[dir="rtl"] .smart-mirror-header,
[dir="rtl"] .smart-mirror-actions,
[dir="rtl"] .project-actions,
[dir="rtl"] .device-key-container,
[dir="rtl"] .latest-request,
[dir="rtl"] .request-header,
[dir="rtl"] .device-key-form {
  direction: rtl;
}

/* RTL: Flip violations and complaints buttons */
[dir="rtl"] .violations-btn-content,
[dir="rtl"] .complaints-btn-content {
  flex-direction: row-reverse;
}

/* RTL: Flip violations and complaints stats */
[dir="rtl"] .violations-stats,
[dir="rtl"] .complaints-stats {
  flex-direction: row-reverse;
}

/* RTL: Flip violations and complaints buttons */
[dir="rtl"] .violations-btn,
[dir="rtl"] .complaints-btn {
  flex-direction: row-reverse;
  text-align: right;
}

/* RTL: Fix accordion arrow direction */
[dir="rtl"] .accordion-arrow svg {
  transform: scaleX(-1);
}

[dir="rtl"] .accordion-header.active .accordion-arrow svg {
  transform: scaleX(-1) rotate(180deg);
}

/* Dark Mode Support for Settings */
.dark .settings-group {
  background: #1f2937;
  border-color: #374151;
}

.dark
/* Mobile app - hover effects disabled */
/* .settings-group:hover {
  border-color: #4b5563;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
} */

.dark .settings-title h4 {
  color: #f9fafb;
}

.dark .settings-title p {
  color: #d1d5db;
}

.dark .option-item {
  background: #111827;
  border-color: #374151;
}

.dark
/* Mobile app - hover effects disabled */
/* .option-item:hover {
  background: #1f2937;
  border-color: #4b5563;
} */

.dark .option-item.active {
  background: #2d1b1b;
  border-color: #AF1E23;
}

.dark .option-label {
  color: #d1d5db;
}

.dark .option-item.active .option-label {
  color: #f9fafb;
}

/* Delete Account Accordion Section */
.delete-account-header {
  border-left: 3px solid #dc2626;
}

.danger-icon {
  color: #dc2626;
  background: #fee2e2;
}

.dark .danger-icon {
  color: #fca5a5;
  background: rgba(220, 38, 38, 0.15);
}

.delete-account-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px;
}

.delete-warning-box {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  margin-bottom: 8px;
}

.dark .delete-warning-box {
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.3);
}

.delete-warning-box svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-content {
  flex: 1;
}

.warning-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #991b1b;
}

.dark .warning-content h4 {
  color: #fca5a5;
}

.warning-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #7f1d1d;
}

.dark .warning-content p {
  color: #fecaca;
}

.delete-info-list {
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.dark .delete-info-list {
  background: rgba(255, 255, 255, 0.03);
}

.delete-info-list h4 {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.dark .delete-info-list h4 {
  color: #f9fafb;
}

.delete-info-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.delete-info-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.dark .delete-info-list li {
  color: #d1d5db;
}

.delete-info-list li svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.delete-account-main-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.delete-account-main-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.delete-account-main-btn svg {
  flex-shrink: 0;
}

/* Delete Account Modal - Matches existing modal style */
.modal-overlay.keyboard-open {
  padding-bottom: 0;
  align-items: flex-start;
  padding-top: 20px;
}

.delete-warning-text {
  margin: 16px 0;
  padding: 12px;
  background: #fef2f2;
  border-radius: 8px;
  border-left: 3px solid #AF1E23;
}

.delete-warning-text p {
  margin: 0;
  color: #374151;
  font-size: 13px;
}

.delete-warning-text strong {
  color: #AF1E23;
}

.confirmation-input {
  margin-top: 20px;
}

.confirmation-input label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.confirm-input {
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
  transition: all 0.2s;
}

.confirm-input:focus {
  outline: none;
  border-color: #AF1E23;
  background: #fef2f2;
}

.delete-confirm-btn {
  background: #AF1E23;
}

.delete-confirm-btn:disabled {
  background: #ccc;
  opacity: 0.6;
}

/* Mobile optimizations for settings */
@media (max-width: 480px) {
  .settings-container {
    padding: 16px;
    gap: 20px;
  }

  .settings-group {
    padding: 16px;
  }

  .settings-header {
    gap: 10px;
  }

  .settings-icon {
    width: 36px;
    height: 36px;
  }

  .settings-title h4 {
    font-size: 1rem;
  }

  .settings-title p {
    font-size: 0.8rem;
  }

  .option-item {
    padding: 10px 12px;
    gap: 10px;
  }

  .option-flag,
  .option-icon {
    font-size: 1.1rem;
  }

  .option-label {
    font-size: 0.8rem;
  }

  .option-check {
    width: 18px;
    height: 18px;
  }

  .option-check svg {
    width: 10px;
    height: 10px;
  }
}

/* Face Verification Section */
.face-id-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin-top: 12px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
}

.status-badge.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-badge.warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background-color: #AF1E23;
  color: white;
}

.action-btn.primary:hover {
  background-color: #8b181c;
}

.action-btn.secondary {
  background-color: #6c757d;
  color: white;
}

.action-btn.secondary:hover {
  background-color: #5a6268;
}


.family-members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 4px;
}

.family-member-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #fff 0%, #fef2f2 100%);
  border: 2px solid #fecdd3;
  border-radius: 16px;
  transition: all 0.3s ease;
}

/* Mobile app - hover effects disabled */
/* .family-member-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(175, 30, 35, 0.15);
  border-color: #AF1E23;
} */

.member-avatar {
  flex-shrink: 0;
}

.avatar-image-small {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-initial-small {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.2);
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role {
  font-size: 13px;
  font-weight: 500;
  color: #AF1E23;
  margin: 0 0 8px 0;
}

.member-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.meta-item svg {
  flex-shrink: 0;
  stroke: #AF1E23;
}

@media (max-width: 768px) {
  .family-members-grid {
    grid-template-columns: 1fr;
  }

  .family-member-card {
    padding: 12px;
  }

  .avatar-image-small,
  .avatar-initial-small {
    width: 48px;
    height: 48px;
  }

  .avatar-initial-small {
    font-size: 18px;
  }

  .member-name {
    font-size: 14px;
  }

  .member-role {
    font-size: 12px;
  }
}
</style>
