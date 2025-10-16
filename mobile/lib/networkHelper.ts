import { Platform } from 'react-native';

export async function checkNetworkConnectivity(): Promise<{
  isConnected: boolean;
  canReachSupabase: boolean;
  error?: string;
}> {
  try {
    console.log('Checking network connectivity...');
    console.log('Platform:', Platform.OS);

    const testUrl = 'https://aexpvbtgtzfwsysxzwew.supabase.co/rest/v1/';

    try {
      const response = await fetch(testUrl, {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleHB2YnRndHpmd3N5c3h6d2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTc0NjUsImV4cCI6MjA3NTk5MzQ2NX0.aUmBkcuMt7GpGLllKGZhdmmcaW9E30uKQPJez0-AU3o'
        },
      });

      console.log('Network check response:', response.status);

      return {
        isConnected: true,
        canReachSupabase: response.status >= 200 && response.status < 500,
      };
    } catch (fetchError) {
      console.error('Network check fetch error:', fetchError);

      return {
        isConnected: false,
        canReachSupabase: false,
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
      };
    }
  } catch (error) {
    console.error('Network check error:', error);
    return {
      isConnected: false,
      canReachSupabase: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function getNetworkErrorMessage(error: any): string {
  if (!error) return 'Unknown error';

  const errorMessage = error.message || error.toString();

  if (errorMessage.includes('Network request failed')) {
    return 'Cannot connect to the server. Please check:\n\n1. Your device has an active internet connection\n2. You are not using a VPN that blocks the connection\n3. Your firewall allows the app to access the internet\n\nTry:\n- Toggling WiFi off and on\n- Restarting the app\n- Checking if you can browse websites in your browser';
  }

  if (errorMessage.includes('timeout')) {
    return 'Connection timed out. The server is taking too long to respond. Please check your internet connection and try again.';
  }

  if (errorMessage.includes('CORS')) {
    return 'Cross-origin request blocked. This is likely a configuration issue.';
  }

  return errorMessage;
}
