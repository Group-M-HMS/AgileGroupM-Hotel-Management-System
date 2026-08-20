import type { Guest } from '../types/hotel';

const first = [
  'Amara', 'Jonas', 'Priya', 'Liam', 'Sofia', 'Kenji', 'Nadia', 'Tom', 'Elena', 'Marcus',
  'Chandi', 'Anya', 'Diego', 'Grace', 'Ravi', 'Ingrid', 'Omar', 'Beatrice', 'Noah', 'Zara',
  'Hugo', 'Leila', 'Peter', 'Mira', 'Sam', 'Isabel', 'Aiden', 'Hana', 'Felix', 'Tara',
  'Bruno', 'Yuki', 'Clara', 'Ethan', 'Naomi', 'Victor', 'Lena', 'Arjun', 'Freya', 'Malik',
];

const last = [
  'Silva', 'Weber', 'Nair', 'O’Connell', 'Ferreira', 'Tanaka', 'Haddad', 'Whitfield', 'Petrova',
  'Bell', 'Perera', 'Novak', 'Morales', 'Adeyemi', 'Kumar', 'Larsen', 'Faruk', 'Lund', 'Kimura',
  'Malik', 'Martin', 'Rahman', 'Lindqvist', 'Costa', 'Okafor', 'Rojas', 'Clarke', 'Yusuf', 'Braun',
  'Singh', 'Sant', 'Mori', 'Dubois', 'Reed',
];

const countries = ['Sri Lanka', 'Germany', 'India', 'Ireland', 'Portugal', 'Japan', 'UAE', 'UK', 'Netherlands', 'Australia', 'Canada', 'Singapore'];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function buildGuests(): Guest[] {
  return Array.from({ length: 310 }, (_, i) => {
    const name = `${first[i % first.length]} ${last[(i * 7) % last.length]}`;
    const slug = name.toLowerCase().replace(/[^a-z]+/g, '.');
    // 88 repeat customers (2+ stays), 24 joined this month.
    const stays = i % 7 === 0 || i % 11 === 0 ? 2 + (i % 4) : 1;
    const joinedMonth = i < 24 ? 7 : (i * 5) % 12;
    const joinedYear = i < 24 ? 2026 : 2024 + (i % 2);
    return {
      id: `guest-${1000 + i}`,
      name,
      email: `${slug}${i}@example.com`,
      phone: `+94 77 ${String(100 + (i % 900)).padStart(3, '0')} ${String(1000 + (i * 37) % 9000).padStart(4, '0')}`,
      stays,
      joined: `${months[joinedMonth]} ${joinedYear}`,
      country: countries[i % countries.length],
    };
  });
}

export const initialGuests: Guest[] = buildGuests();
