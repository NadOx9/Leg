import axios from 'axios';

interface ExcuseResponse {
  excuse: string;
  error?: string;
}

export const generateExcuse = async (reason: string, type: 'serious' | 'cheeky' | 'funny'): Promise<string> => {
  try {
    if (!reason.trim()) {
      throw new Error('Please provide a reason for the excuse.');
    }

    const response = await axios.post<ExcuseResponse>('/api/generate-excuse', { 
      reason: reason.trim(), 
      type 
    });
    
    if (response.data.error) {
      console.error('API returned error:', response.data.error);
      throw new Error(response.data.error);
    }
    
    if (!response.data.excuse) {
      console.error('API returned no excuse');
      throw new Error('No excuse was generated');
    }
    
    return response.data.excuse;
  } catch (error: any) {
    console.error('Full API error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error('Too many requests. Please try again in a moment.');
      }
      if (error.response?.status === 500) {
        const errorMessage = error.response.data?.error || 'Server error. Please try again later.';
        throw new Error(errorMessage);
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your API key.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (!error.response) {
        throw new Error('Network error. Please check your connection.');
      }
    }
    
    throw error.message || 'Failed to generate excuse. Please try again.';
  }
}

export const processPayment = async (paymentDetails: any): Promise<{ success: boolean, message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Payment processed successfully!' });
    }, 1500);
  });
};