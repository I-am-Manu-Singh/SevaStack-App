export type UserRole = 'customer' | 'merchant' | 'staff' | 'admin';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string; // For merchant/staff
}

// Current Mock Session - You can update this to test different views
export const MOCK_SESSION: UserSession = {
  id: 'u1',
  name: 'Manpreet Singh',
  email: 'manpreet@example.com',
  role: 'merchant', // Change to 'customer' to see the discovery side
  businessId: 'b1'
};

export const canAccess = (userRole: UserRole, allowedRoles: UserRole[]) => {
  return allowedRoles.includes(userRole);
};
