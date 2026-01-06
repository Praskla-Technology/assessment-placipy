/**
 * Utility function to convert technical error messages to user-friendly messages
 * @param error - The error object or message
 * @returns A user-friendly error message
 */
export const getFriendlyErrorMessage = (error: any): string => {
  // If it's a string, return it directly
  if (typeof error === 'string') {
    return error;
  }

  // If it's an error object, extract the message
  if (error && typeof error === 'object') {
    // Check for common error response structuresa
    if (error.response?.data?.message) {
      return getFriendlyMessageFromCode(error.response.data.message);
    }
    
    if (error.response?.data?.error) {
      return getFriendlyMessageFromCode(error.response.data.error);
    }
    
    if (error.message) {
      return getFriendlyMessageFromCode(error.message);
    }
    
    if (error.response?.status) {
      return getFriendlyMessageFromStatus(error.response.status);
    }
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Convert technical error messages to friendly messages
 */
const getFriendlyMessageFromCode = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  // Common technical error messages and their friendly versions
  if (lowerMessage.includes('network error')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  if (lowerMessage.includes('500') || lowerMessage.includes('internal server')) {
    return 'Something went wrong on our end. Please try again later.';
  }
  
  if (lowerMessage.includes('404') || lowerMessage.includes('not found')) {
    return 'The requested resource was not found. Please try again.';
  }
  
  if (lowerMessage.includes('401') || lowerMessage.includes('unauthorized')) {
    return 'You don\'t have access to this content. Please log in again.';
  }
  
  if (lowerMessage.includes('403') || lowerMessage.includes('forbidden')) {
    return 'You don\'t have permission to access this content.';
  }
  
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timeout')) {
    return 'The request took too long. Please check your internet connection and try again.';
  }
  
  if (lowerMessage.includes('duplicate') || lowerMessage.includes('unique constraint')) {
    return 'This item already exists. Please try with different information.';
  }
  
  if (lowerMessage.includes('validation failed') || lowerMessage.includes('invalid')) {
    return 'The information provided is invalid. Please check and try again.';
  }
  
  if (lowerMessage.includes('email') && lowerMessage.includes('invalid')) {
    return 'The email address provided is invalid. Please check and try again.';
  }
  
  if (lowerMessage.includes('password') && (lowerMessage.includes('weak') || lowerMessage.includes('short'))) {
    return 'The password is too weak. Please use a stronger password.';
  }
  
  // Return the original message if no specific conversion found
  return message;
};

/**
 * Convert HTTP status codes to friendly messages
 */
const getFriendlyMessageFromStatus = (status: number): string => {
  switch (status) {
    case 400:
      return 'The request was invalid. Please check your input and try again.';
    case 401:
      return 'You need to log in to access this content.';
    case 403:
      return 'You don\'t have permission to access this content.';
    case 404:
      return 'The requested content was not found.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Something went wrong on our end. Please try again later.';
    case 502:
      return 'The server is temporarily unavailable. Please try again later.';
    case 503:
      return 'The service is temporarily unavailable. Please try again later.';
    default:
      return `The server returned an error (${status}). Please try again.`;
  }
};

/**
 * Error handler class for consistent error handling
 */
export class StudentErrorHandler {
  static handle(error: any, customMessage?: string): string {
    if (customMessage) {
      return customMessage;
    }
    return getFriendlyErrorMessage(error);
  }

  static logError(error: any, context: string = ''): void {
    console.group(`Error in ${context || 'unknown context'}`);
    console.error('Error object:', error);
    if (error?.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    console.groupEnd();
  }
}