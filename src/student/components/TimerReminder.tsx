import React, { useEffect, useState } from 'react';

interface TimerReminderProps {
  scheduledAt: string | Date | null | undefined;
}

const TimerReminder: React.FC<TimerReminderProps> = ({ scheduledAt }) => {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!scheduledAt) {
      setRemainingMs(null);
      return;
    }

    const target =
      typeof scheduledAt === 'string' ? new Date(scheduledAt).getTime() : scheduledAt.getTime();

    if (isNaN(target)) {
      setRemainingMs(null);
      return;
    }

    const update = () => {
      const now = Date.now();
      const diff = target - now;
      setRemainingMs(diff > 0 ? diff : 0);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  if (remainingMs === null) {
    return null;
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const format = (n: number) => n.toString().padStart(2, '0');

  const isUnderTenMinutes = remainingMs <= 10 * 60 * 1000;

  return (
    <span
      style={{
        fontSize: '12px',
        fontWeight: 500,
        color: isUnderTenMinutes ? '#DC2626' : '#2563EB',
      }}
    >
      Starts in {format(hours)}:{format(minutes)}:{format(seconds)}
    </span>
  );
};

export default TimerReminder;


