/* eslint-disable @typescript-eslint/no-unsafe-assignment */

export class ApiResponse {
  static success<T>(data: T, message = 'Success') {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(error: any = null, message = 'Something went wrong') {
    return {
      success: false,
      message,
      error,
    };
  }
}
