// User Roles
export enum UserRole {
  ADMIN = 'ADMIN',
  DISPATCHER = 'DISPATCHER',
  DRIVER = 'DRIVER',
}

// Vehicle Status
export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  ON_TRIP = 'ON_TRIP',
  MAINTENANCE = 'MAINTENANCE',
}

// Vehicle Type
export enum VehicleType {
  VIP_LIMO = 'VIP_LIMO',
  SUV = 'SUV',
  SHUTTLE_VAN = 'SHUTTLE_VAN',
}

// Trip Status
export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  EN_ROUTE = 'EN_ROUTE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Driver Status
export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  ON_TRIP = 'ON_TRIP',
  OFF_DUTY = 'OFF_DUTY',
  SUSPENDED = 'SUSPENDED',
}
