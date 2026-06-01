let nextId = 100;

export const rooms = [
  { id: 1,  name: 'Conference A',    capacity: 10, floor: 1, amenities: 'Projector, Whiteboard, Zoom',          description: 'Large room with video conferencing' },
  { id: 2,  name: 'Meeting Room B',  capacity: 6,  floor: 1, amenities: 'TV Screen, Whiteboard',                description: 'Medium room for team meetings' },
  { id: 3,  name: 'Board Room',      capacity: 16, floor: 2, amenities: 'Projector, Conference Phone, TV',       description: 'Executive boardroom with premium AV' },
  { id: 4,  name: 'Focus Room 1',    capacity: 2,  floor: 2, amenities: 'Monitor, Noise-cancelling',            description: 'Quiet room for focused work' },
  { id: 5,  name: 'Focus Room 2',    capacity: 2,  floor: 3, amenities: 'Monitor, Whiteboard',                  description: 'Small quiet room for pair work' },
  { id: 6,  name: 'Training Room',   capacity: 20, floor: 3, amenities: 'Projector, Whiteboard, Sound System',  description: 'Large room for training sessions' },
  { id: 7,  name: 'Huddle Space',    capacity: 4,  floor: 1, amenities: 'TV Screen, Whiteboard',                description: 'Casual huddle space near kitchen' },
  { id: 8,  name: 'Creative Studio', capacity: 8,  floor: 2, amenities: 'Projector, Whiteboard, Standing Desks', description: 'Flexible creative workspace' },
];

export const users = [
  { id: 1,  name: 'Alice Johnson', role: 'admin', password: 'alice123' },
  { id: 2,  name: 'Bob Smith',     role: 'owner', password: 'bob123' },
  { id: 3,  name: 'Charlie Brown',  role: 'user',  password: 'charlie123' },
  { id: 4,  name: 'Diana Prince',   role: 'user',  password: 'diana123' },
  { id: 5,  name: 'Eve Adams',      role: 'user',  password: 'eve123' },
  { id: 6,  name: 'Frank Castle',   role: 'owner', password: 'frank123' },
];

export const bookings = [
  { id: 1,  userId: 1, roomId: 1, startTime: '2026-06-01T09:00:00Z', endTime: '2026-06-01T10:00:00Z', createdAt: '2026-05-28T08:00:00Z' },
  { id: 2,  userId: 1, roomId: 2, startTime: '2026-06-02T14:00:00Z', endTime: '2026-06-02T15:30:00Z', createdAt: '2026-05-28T09:00:00Z' },
  { id: 3,  userId: 2, roomId: 3, startTime: '2026-06-01T11:00:00Z', endTime: '2026-06-01T12:00:00Z', createdAt: '2026-05-29T10:00:00Z' },
  { id: 4,  userId: 3, roomId: 1, startTime: '2026-06-03T08:00:00Z', endTime: '2026-06-03T09:00:00Z', createdAt: '2026-05-29T11:00:00Z' },
  { id: 5,  userId: 3, roomId: 5, startTime: '2026-06-03T10:00:00Z', endTime: '2026-06-03T11:00:00Z', createdAt: '2026-05-30T12:00:00Z' },
  { id: 6,  userId: 4, roomId: 4, startTime: '2026-06-04T13:00:00Z', endTime: '2026-06-04T14:00:00Z', createdAt: '2026-05-30T13:00:00Z' },
  { id: 7,  userId: 5, roomId: 7, startTime: '2026-06-05T09:30:00Z', endTime: '2026-06-05T10:30:00Z', createdAt: '2026-05-31T08:00:00Z' },
  { id: 8,  userId: 6, roomId: 6, startTime: '2026-06-05T15:00:00Z', endTime: '2026-06-05T16:00:00Z', createdAt: '2026-05-31T09:00:00Z' },
  { id: 9,  userId: 2, roomId: 8, startTime: '2026-06-06T10:00:00Z', endTime: '2026-06-06T12:00:00Z', createdAt: '2026-05-31T10:00:00Z' },
  { id: 10, userId: 4, roomId: 2, startTime: '2026-06-06T09:00:00Z', endTime: '2026-06-06T10:00:00Z', createdAt: '2026-05-31T11:00:00Z' },
];

export function generateId() {
  return ++nextId;
}
