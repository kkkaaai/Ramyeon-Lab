-- Starter announcements so the homepage Latest News section isn't empty at launch.
-- Edit/add rows here until the admin UI for announcements ships.

insert into public.announcements (title, body) values
  ('WELCOME TO RAMYEON LABS', 'A Sunday coworking syndicate for London builders. One ramyeon machine. Many founders. Bring your laptop, cook noodles, ship code.'),
  ('FIRST SUNDAY SESSION LIVE', 'Our inaugural session is live — grab an invite link from the host, create your profile, and join the queue when you arrive.');
