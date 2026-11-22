// 백엔드 JwtPayload(sub, email, name)를 그대로 따른다.
export interface Session {
  id: string;
  email: string;
  name: string;
}

export interface Stay {
  id: number;
  name: string;
  address: string;
  point: [number, number];
  rating: number;
  pricePerDay: number;
  maxGuests: number;
  imageUrl: string;
  host?: { id: string; name: string };
}
