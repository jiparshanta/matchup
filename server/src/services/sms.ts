// Nepal SMS Provider Integration (Sparrow SMS)
// Documentation: https://docs.sparrowsms.com/

interface SendOTPResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const sendOTP = async (phone: string, otp: string): Promise<SendOTPResponse> => {
  const token = process.env.SPARROW_SMS_TOKEN;
  const from = process.env.SPARROW_SMS_FROM || 'MatchUp';

  // In development, just log the OTP
  if (process.env.NODE_ENV !== 'production' || !token) {
    console.log(`[DEV SMS] OTP for ${phone}: ${otp}`);
    return { success: true, message: 'OTP logged (dev mode)' };
  }

  try {
    const message = `Your MatchUp verification code is: ${otp}. Valid for 5 minutes.`;

    const response = await fetch('https://api.sparrowsms.com/v2/sms/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        from,
        to: phone,
        text: message,
      }),
    });

    const data = await response.json();

    if (response.ok && data.response_code === 200) {
      return { success: true, message: 'OTP sent successfully' };
    }

    return {
      success: false,
      error: data.message || 'Failed to send SMS',
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      error: 'Failed to send SMS',
    };
  }
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
