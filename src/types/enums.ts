// These should match the Prisma enums
export enum ItemCategory {
  FURNITURE = 'FURNITURE',
  LINENS = 'LINENS',
  EQUIPMENT = 'EQUIPMENT',
  FOOD = 'FOOD'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export enum EscalationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum EscalationStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}
