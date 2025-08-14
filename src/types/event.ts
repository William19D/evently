export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  rating: number;
  reviews: number;
  location: {
    address: string;
    city: string;
    department: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  organizer: {
    name: string;
    avatar: string;
    rating: number;
    events: number;
  };
  amenities: string[];
  includes: string[];
  rules: string[];
  gallery: string[];
  availability: {
    [date: string]: boolean;
  };
}

export interface EventBooking {
  id: string;
  eventId: string;
  userId: string;
  date: string;
  time: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}
