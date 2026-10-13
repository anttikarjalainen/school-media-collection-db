-- games_db: schema and dummy data. Run by `npm run db:setup` as games_owner.

create table games (
  id       integer generated always as identity primary key,
  title    text    not null check (length(trim(title)) between 1 and 200),
  platform text    not null check (length(trim(platform)) between 1 and 200),
  year     integer not null check (year between 1000 and 2100)
);

insert into games (title, platform, year) values
  ('Hades', 'PC', 2020),
  ('Alan Wake 2', 'PC', 2023),
  ('The Legend of Zelda: Breath of the Wild', 'Nintendo Switch', 2017),
  ('Celeste', 'PC', 2018),
  ('Disco Elysium', 'PC', 2019),
  ('Outer Wilds', 'PC', 2019),
  ('Elden Ring', 'PlayStation 5', 2022);
