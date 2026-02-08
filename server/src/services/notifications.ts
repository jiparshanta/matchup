import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { prisma } from './prisma.js';

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
});

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export const sendPushNotification = async (
  userId: string,
  notification: NotificationPayload
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true },
    });

    if (!user?.expoPushToken) {
      console.log(`No push token for user ${userId}`);
      return;
    }

    if (!Expo.isExpoPushToken(user.expoPushToken)) {
      console.log(`Invalid push token for user ${userId}`);
      return;
    }

    const message: ExpoPushMessage = {
      to: user.expoPushToken,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data,
    };

    const chunks = expo.chunkPushNotifications([message]);

    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export const sendBulkPushNotifications = async (
  userIds: string[],
  notification: NotificationPayload
) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        expoPushToken: { not: null },
      },
      select: { id: true, expoPushToken: true },
    });

    const messages: ExpoPushMessage[] = users
      .filter((u) => u.expoPushToken && Expo.isExpoPushToken(u.expoPushToken))
      .map((user) => ({
        to: user.expoPushToken!,
        sound: 'default' as const,
        title: notification.title,
        body: notification.body,
        data: notification.data,
      }));

    if (messages.length === 0) {
      return;
    }

    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }
  } catch (error) {
    console.error('Error sending bulk push notifications:', error);
  }
};

export const createInAppNotification = async (
  userId: string,
  notification: {
    title: string;
    body: string;
    type: 'game_reminder' | 'game_update' | 'rsvp_update' | 'general';
    data?: Record<string, unknown>;
  }
) => {
  return prisma.notification.create({
    data: {
      userId,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      data: notification.data,
    },
  });
};
