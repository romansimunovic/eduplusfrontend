EduPlus Frontend

Ovo je frontend dio aplikacije EduPlus, izrađen u sklopu kolegija Informacijsko-komunikacijska infrastruktura pod mentorstvom izv. prof. dr. sc. Tomislava Jakopeca.
U dokumentaciji i kodu korišten je i ChatGPT Plus kao podrška u razvoju.

Aplikacija je razvijena u Reactu i koristi lokalne JSON datoteke kao izvor podataka umjesto aktivnog API-ja.
Cilj projekta je prikazati kako funkcionira jednostavno frontend sučelje koje može raditi neovisno o backendu, uz mogućnost budućeg povezivanja na pravu bazu podataka ili REST API.

Funkcionalnosti:

Pregled svih radionica

Pregled svih polaznika

Evidencija prisustva po radionici

Detaljan prikaz svake radionice i prisutnosti sudionika

Aplikacija koristi HashRouter za jednostavnije pokretanje i deploy, što omogućuje prikaz svih stranica bez potrebe za backendom.
Svi podaci (radionice, polaznici, prisustva) nalaze se u .json datotekama unutar mape public.

Pokretanje aplikacije:

Instalirati ovisnosti pomoću naredbe
npm install

Pokrenuti razvojni poslužitelj
npm start

Za izradu produkcijskog builda
npm run build

Za lokalni pregled builda
serve -s build

Aplikacija se po pokretanju otvara na adresi http://localhost:3000.

Korištene tehnologije:

React (Create React App)

React Router (HashRouter)

HTML, CSS i JavaScript

Napomena:
Ova verzija aplikacije koristi statičke podatke i služi kao edukativni primjer frontenda koji se može proširiti dodavanjem aktivnog API-ja ili baze podataka.
