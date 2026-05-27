import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export const connectSignalR = (
  token: string,
  onNotification: (data: { id: number; message: string; dateEnvoi: string; estLu: boolean; utilisateurId: number }) => void
): signalR.HubConnection => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:5011/hubs/notifications';

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build();

  connection.on('NouvelleNotification', (data) => {
    onNotification(data);
  });

  connection.start().catch((err) => {
    console.error('SignalR connection error:', err);
  });

  connection.onreconnecting((err) => {
    console.warn('SignalR reconnecting...', err);
  });

  connection.onreconnected(() => {
    console.info('SignalR reconnected');
  });

  connection.onclose(() => {
    console.info('SignalR connection closed');
  });

  return connection;
};

export const disconnectSignalR = (): void => {
  if (connection) {
    connection.stop();
    connection = null;
  }
};

export const getConnection = (): signalR.HubConnection | null => connection;
