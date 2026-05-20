import { AppCustomization } from './Types';

export const BUSINESS_CONFIGS = {
  Barber: { dashboardTitle: 'Barber Shop', actionLabel: 'New Cut', specialFeature: 'AI Style Finder', statLabel: 'Appointments' },
  Tailor: { dashboardTitle: 'Tailor Studio', actionLabel: 'Measure', specialFeature: 'Stitching Tracker', statLabel: 'Orders' },
  Laundry: { dashboardTitle: 'Laundry', actionLabel: 'Log Wash', specialFeature: 'Status Update', statLabel: 'Loads' },
  Cafe: { dashboardTitle: 'Kota Cafe', actionLabel: 'New Pay', specialFeature: 'Student Combo Menu', statLabel: 'Orders' },
  Kirana: { dashboardTitle: 'Kirana Store', actionLabel: 'Scan Item', specialFeature: 'Khata Book', statLabel: 'Sales' },
  Pharmacy: { dashboardTitle: 'Medical Store', actionLabel: 'Check Prescription', specialFeature: 'Refill Reminder', statLabel: 'Refills' },
  Tiffin: { dashboardTitle: 'Student Mess', actionLabel: 'Meal Prep', specialFeature: 'Menu of the Day', statLabel: 'Daily Thalis' },
  Milk: { dashboardTitle: 'Milk Delivery', actionLabel: 'Add Extra', specialFeature: 'Vacation Pause', statLabel: 'Subscribers' },
  Jewelry: { dashboardTitle: 'Jewelry Shop', actionLabel: 'Price Check', specialFeature: 'Goldbachat Scheme', statLabel: 'Repairs' },
  Hostel: { dashboardTitle: 'Hostel/PG', actionLabel: 'Rent Log', specialFeature: 'Amenity Manager', statLabel: 'Rooms' },
  Library: { dashboardTitle: 'Study Library', actionLabel: 'Seat Check', specialFeature: 'Silent Zone Slot', statLabel: 'Seats' },
  Stationery: { dashboardTitle: 'Stationery', actionLabel: 'Stock Check', specialFeature: 'Combo Bundles', statLabel: 'Sales' },
  Travel: { dashboardTitle: 'Travel Desk', actionLabel: 'New Booking', specialFeature: 'PNR Tracker', statLabel: 'Tickets' },
  Transport: { dashboardTitle: 'Mobility', actionLabel: 'Assign Driver', specialFeature: 'Fleet Map', statLabel: 'Rides' },
  Handyman: { dashboardTitle: 'Services', actionLabel: 'New Ticket', specialFeature: 'Job Queue', statLabel: 'Repairs' },
  Tuition: { dashboardTitle: 'Teaching', actionLabel: 'New Batch', specialFeature: 'Student Progress', statLabel: 'Students' },
};

export const DEFAULT_CONFIG: AppCustomization = {
  businessName: 'KotaSevaBazaar',
  themeColor: '#6366F1',
  tabs: [
    { id: 'index', name: 'Dashboard', label: 'Home', icon: 'LayoutDashboard', isVisible: true },
    { id: 'discover', name: 'Discover', label: 'Explore', icon: 'Compass', isVisible: true },
    { id: 'manage', name: 'Bookings', label: 'Tasks', icon: 'Calendar', isVisible: true },
    { id: 'staff', name: 'Team', label: 'Staff', icon: 'Users', isVisible: true },
    { id: 'profile', name: 'Account', label: 'Profile', icon: 'User', isVisible: true },
  ]
};
