-- books_db: schema and dummy data. Run by `npm run db:setup` as books_owner.

create table books (
  id     integer generated always as identity primary key,
  title  text    not null check (length(trim(title)) between 1 and 200),
  author text    not null check (length(trim(author)) between 1 and 200),
  year   integer not null check (year between 1000 and 2100)
);

insert into books (title, author, year) values
  ('The Left Hand of Darkness', 'Ursula K. Le Guin', 1969),
  ('Beloved', 'Toni Morrison', 1987),
  ('The Remains of the Day', 'Kazuo Ishiguro', 1989),
  ('Dune', 'Frank Herbert', 1965),
  ('Pachinko', 'Min Jin Lee', 2017),
  ('The Road', 'Cormac McCarthy', 2006),
  ('Kalevala', 'Elias Lönnrot', 1835),
  ('Finn Family Moomintroll', 'Tove Jansson', 1948),
  ('Piranesi', 'Susanna Clarke', 2020),
  ('A Wizard of Earthsea', 'Ursula K. Le Guin', 1968),
  ('Klara and the Sun', 'Kazuo Ishiguro', 2021),
  ('The Name of the Rose', 'Umberto Eco', 1980),
  ('The Unknown Soldier', 'Väinö Linna', 1954),
  ('Seven Brothers', 'Aleksis Kivi', 1870),
  ('One Hundred Years of Solitude', 'Gabriel García Márquez', 1967),
  ('Never Let Me Go', 'Kazuo Ishiguro', 2005),
  ('The Dispossessed', 'Ursula K. Le Guin', 1974),
  ('Purge', 'Sofi Oksanen', 2008),
  ('Station Eleven', 'Emily St. John Mandel', 2014),
  ('The Summer Book', 'Tove Jansson', 1972);
