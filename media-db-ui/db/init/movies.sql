-- movies_db: schema and dummy data. Run by `npm run db:setup` as movies_owner.

create table movies (
  id       integer generated always as identity primary key,
  title    text    not null check (length(trim(title)) between 1 and 200),
  director text    not null check (length(trim(director)) between 1 and 200),
  year     integer not null check (year between 1000 and 2100)
);

insert into movies (title, director, year) values
  ('Spirited Away', 'Hayao Miyazaki', 2001),
  ('Parasite', 'Bong Joon-ho', 2019),
  ('The Man Without a Past', 'Aki Kaurismäki', 2002),
  ('Arrival', 'Denis Villeneuve', 2016),
  ('In the Mood for Love', 'Wong Kar-wai', 2000),
  ('Mad Max: Fury Road', 'George Miller', 2015),
  ('Portrait of a Lady on Fire', 'Céline Sciamma', 2019),
  ('Fallen Leaves', 'Aki Kaurismäki', 2023);
