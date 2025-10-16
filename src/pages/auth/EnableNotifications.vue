<template>
  <q-page class="flex flex-center" padding>
    <div class="column items-center q-gutter-md" style="max-width: 500px">
      <q-icon name="notifications_active" size="80px" color="primary" />
      
      <div class="text-h5 text-center">{{ $t('enableNotifications') }}</div>
      
      <div class="text-body1 text-center text-grey-7">
        {{ $t('enableNotificationsDescription') }}
      </div>

      <div v-if="permissionStatus === 'denied'" class="text-center">
        <q-banner class="bg-red-1 text-red-9" rounded>
          <template v-slot:avatar>
            <q-icon name="warning" color="red" />
          </template>
          <div class="text-body2">
            {{ $t('notificationsBlocked') }}
          </div>
          <div class="text-caption q-mt-sm">
            {{ $t('notificationsBlockedHelp') }}
          </div>
        </q-banner>
      </div>

      <q-btn
        v-if="permissionStatus !== 'granted'"
        :loading="loading"
        :disable="permissionStatus === 'denied'"
        color="primary"
        size="lg"
        rounded
        unelevated
        @click="requestPermission"
      >
        <q-icon left name="notifications" />
        {{ permissionStatus === 'denied' ? $t('notificationsBlockedInBrowser') : $t('enableNotifications') }}
      </q-btn>

      <q-btn
        v-else
        color="green"
        size="lg"
        rounded
        unelevated
        icon="check_circle"
        :to="'/home'"
      >
        {{ $t('notificationsEnabled') }} - {{ $t('continue') }}
      </q-btn>

      <q-btn
        flat
        color="grey-7"
        :to="'/home'"
      >
        {{ $t('skipForNow') }}
      </q-btn>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fcmService } from 'src/services/fcmService';

const loading = ref(false);
const permissionStatus = ref('default');

onMounted(async () => {
  // Check current permission status
  const status = await fcmService.getPermissionStatus();
  permissionStatus.value = status;
  console.log('Notification permission status:', status);
});

const requestPermission = async () => {
  loading.value = true;
  
  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    permissionStatus.value = permission;
    
    console.log('Permission result:', permission);
    
    if (permission === 'granted') {
      // FCM is already initialized by the boot file (src/boot/fcm.js)
      // Just log success - no need to initialize again
      console.log('Notifications enabled - FCM is managed by boot file');
    }
  } catch (error) {
    console.error('Error requesting permission:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<i18n>
{
  "en": {
    "enableNotifications": "Enable Notifications",
    "enableNotificationsDescription": "Get notified about bookings, events, and important updates",
    "notificationsBlocked": "Notifications are blocked in your browser",
    "notificationsBlockedHelp": "Please allow notifications in your browser settings to continue",
    "notificationsBlockedInBrowser": "Blocked - Check Browser Settings",
    "notificationsEnabled": "Notifications Enabled",
    "continue": "Continue",
    "skipForNow": "Skip for now"
  },
  "ar": {
    "enableNotifications": "تفعيل الإشعارات",
    "enableNotificationsDescription": "احصل على إشعارات حول الحجوزات والفعاليات والتحديثات المهمة",
    "notificationsBlocked": "الإشعارات محظورة في متصفحك",
    "notificationsBlockedHelp": "يرجى السماح بالإشعارات في إعدادات المتصفح للمتابعة",
    "notificationsBlockedInBrowser": "محظور - تحقق من إعدادات المتصفح",
    "notificationsEnabled": "تم تفعيل الإشعارات",
    "continue": "متابعة",
    "skipForNow": "تخطي الآن"
  }
}
</i18n>

