export interface JwtPayload {
    id: string;    // Unique user identifier (required)
    email: string; // Email of the user (optional)
    role: string;  // User's role, such as 'admin' or 'student' (optional)
  }
  