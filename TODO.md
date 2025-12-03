# Remove Reminders from Notifications

## Tasks
- [ ] Remove 'reminder' from Notification type in src/services/notification.service.ts
- [ ] Remove 'reminders' tab and related logic from src/student/components/Notifications.tsx
- [ ] Remove 'reminder' case from getIcon in src/student/components/NotificationPopup.tsx
- [ ] Remove reminder sending logic from backend/src/cron/notificationCron.ts
- [ ] Remove reminder-related methods from backend/src/services/NotificationService.ts

## Testing
- [ ] Test that notifications still work for assessment_published, result_published, and announcement types
- [ ] Verify that no reminder notifications are sent via cron jobs
