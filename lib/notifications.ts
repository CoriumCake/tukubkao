import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#A5B68D',
    });
  }
  
  return true;
}

// Schedule a notification
export async function scheduleNotification(title: string, body: string, trigger: Notifications.NotificationTriggerInput) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger,
  });
}

// Cancel all notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Schedule daily check for expiring ingredients
export async function scheduleExpirationCheck() {
  // Cancel any existing checks
  await cancelAllNotifications();
  
  // Schedule daily check at 9 AM
  await scheduleNotification(
    'Expiring Ingredients Check',
    'Checking for ingredients that will expire soon...',
    {
      type: 'timeInterval',
      seconds: 24 * 60 * 60, // 24 hours
      repeats: true,
    }
  );
} 