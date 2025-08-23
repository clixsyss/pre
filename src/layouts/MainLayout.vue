<template>
  <div class="main-layout">
    <!-- Header (Black) -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo">
            <div class="logo-text">P</div>
            <div class="logo-subtext">
              <span class="relive-text">Relive.</span>
              <div class="pre-text">
                <span class="r-letter">R</span><span class="e-letter">E</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <div class="qr-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H7V7H3V3Z" stroke="#ff6b35" stroke-width="2" fill="#ff6b35"/>
              <path d="M17 3H21V7H17V3Z" stroke="#ff6b35" stroke-width="2" fill="#ff6b35"/>
              <path d="M3 17H7V21H3V17Z" stroke="#ff6b35" stroke-width="2" fill="#ff6b35"/>
              <path d="M17 17H21V21H17V17Z" stroke="#ff6b35" stroke-width="2" fill="#ff6b35"/>
              <path d="M9 9H11V11H9V9Z" stroke="#ff6b35" stroke-width="2" fill="#ff6b35"/>
              <path d="M13 13H15V15H13V13Z" stroke="#ff6b35" stroke-width="2" fill="#ff6b35"/>
            </svg>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Bottom Navigation -->
    <nav class="bottom-navigation">
      <router-link to="/home" class="nav-item" active-class="active">
        <div class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </router-link>

      <router-link to="/access" class="nav-item" active-class="active">
        <div class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="nav-label">Access</span>
      </router-link>

      <router-link to="/services" class="nav-item" active-class="active">
        <div class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.7 6.3A1 1 0 0 0 14 7H9.5L8.5 8L9.5 9H14A1 1 0 0 0 14.7 9.7L18.3 13.3A1 1 0 0 0 19.7 11.7L16.1 8.1L14.7 6.3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.3 17.7A1 1 0 0 0 10 17H14.5L15.5 16L14.5 15H10A1 1 0 0 0 9.3 14.3L5.7 10.7A1 1 0 0 0 4.3 12.3L7.9 15.9L9.3 17.7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </router-link>

      <router-link to="/profile" class="nav-item" active-class="active">
        <div class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
// Component name for ESLint
defineOptions({
  name: 'MainLayout'
})
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
}



/* Header Styles */
.app-header {
  background-color: #000;
  color: white;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.logo-subtext {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.relive-text {
  font-size: 0.75rem;
  color: #ccc;
  font-weight: 400;
}

.pre-text {
  display: flex;
  gap: 2px;
}

.r-letter {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b35;
  line-height: 1;
}

.e-letter {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b35;
  line-height: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.qr-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* Bottom Navigation */
.bottom-navigation {
  background-color: #333;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 20px 20px 40px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #999;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  color: #ccc;
}

.nav-item.active {
  color: white;
}

.nav-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item.active .nav-icon {
  background-color: #ff6b35;
  color: white;
  transform: translateY(-20px);
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
  border: 4px solid white;
  width: 68px;
  height: 68px;
}

.nav-item.active .nav-icon svg {
  stroke: white;
}

.nav-item:not(.active) .nav-icon {
  background: none;
}

.nav-item .nav-label {
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 4px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
    padding: 12px 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-left, .header-center, .header-right {
    width: 100%;
    justify-content: center;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .bottom-navigation {
    padding: 12px 16px 28px;
  }
  
  .nav-icon {
    width: 40px;
    height: 40px;
  }
  
  .nav-item.active .nav-icon {
    transform: translateY(-8px);
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 10px 12px;
  }
  
  .main-content {
    padding: 12px;
  }
  
  .bottom-navigation {
    padding: 10px 12px 24px;
  }
  
  .nav-icon {
    width: 36px;
    height: 36px;
  }
  
  .nav-item.active .nav-icon {
    transform: translateY(-6px);
  }
}
</style>
