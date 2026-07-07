export const t = {
  site: {
    title: 'Posjeti Bužim – Vikend kuće',
    description:
      'Pregledajte vikend kuće s bazenima u Buzimu. Kontaktirajte vlasnike direktno za rezervaciju.',
  },
  home: {
    heading: 'Posjeti Bužim',
    subtitle:
      'Otkrijte mir prirode i uživajte u odmoru u jednoj od naših vikendica sa bazenom — okruženi zelenilom i gostoljubivošću malog bosanskog grada.',
    empty: 'Trenutno nema dostupnih oglasa.',
    listingsHeading: 'Izdvojene vikendice',
    aboutTitle: 'O Bužimu',
    aboutP1:
      'Bužim je manji grad smješten u Unsko-sanskom kantonu, poznat po svojoj staroj tvrđavi koja dominira panoramom mjesta i svjedoči o bogatoj historiji ovog kraja. Okružen zelenim brdima i mirnom prirodom, Bužim nudi pravi bijeg od svakodnevne gužve — idealno mjesto za odmor u prirodi, uz gostoljubivost lokalnog stanovništva.',
    aboutP2:
      'Bilo da tražite mir za porodični odmor ili priliku za istraživanje netaknute prirode Krajine, Bužim vas dočekuje otvorenih ruku.',
  },
  house: {
    pool: 'Bazen',
    guests: (n: number) => `Do ${n} gostiju`,
    perNight: (price: number) => `${price} KM / noć`,
    about: 'O ovoj kući',
    checkAvailability: 'Provjeri dostupnost',
    howToBook: 'Kako rezervisati',
    howToBookBody:
      'Rezervacija se dogovara direktno s vlasnikom. Kada provjerite da su datumi slobodni, kontaktirajte vlasnika i dogovorite boravak.',
  },
  availability: {
    checkIn: 'Dolazak',
    checkOut: 'Odlazak',
    available: 'Ovi datumi su slobodni! Kontaktirajte vlasnika za rezervaciju.',
    unavailable: 'Nažalost, kuća nije dostupna za odabrane datume.',
    invalid: 'Datum dolaska mora biti prije datuma odlaska.',
  },
}
