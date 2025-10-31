EdukatorPlus je web aplikacija za jednostavno vođenje edukacijskih radionica, polaznika i evidencije prisustva.
Sastoji se od React frontenda i Spring Boot backenda povezanih s PostgreSQL (Neon) bazom podataka.

Opis
Aplikacija omogućuje unos, uređivanje i brisanje radionica i polaznika, vođenje prisustva po radionici te prikaz statistike u stvarnom vremenu.
Sučelje je jednostavno, responzivno i prilagođeno za korištenje na računalima i mobilnim uređajima.

Glavne funkcionalnosti

Pregled i upravljanje radionicama i polaznicima

Evidencija prisustva po radionici

Pretraživanje i filtriranje podataka

Statistika prisustva

Generiranje testnih podataka pomoću Faker biblioteke

Tehnologije

Frontend: React, CSS, Fetch API
Backend: Spring Boot, Java, JPA, PostgreSQL
Hosting:

Frontend: Vercel

Backend: Render

Baza: Neon PostgreSQL

Pokretanje projekta
Frontend
git clone https://github.com/romansimunovic/eduplusfrontend.git
cd eduplusfrontend
npm install
npm start


Aplikacija se otvara na http://localhost:3000

Backend
git clone https://github.com/romansimunovic/eduplusbackend.git
cd eduplusbackend
mvn spring-boot:run


Backend se pokreće na http://localhost:8080

Deploy

Frontend: Vercel

Backend: Render

Baza: Neon PostgreSQL

Aplikacija koristi REST API endpoint:
https://eduplus-backend.onrender.com/api

Frontend koristi .env.production postavke:

REACT_APP_API_BASE=https://eduplus-backend.onrender.com
REACT_APP_ENABLE_SEED=false

Dostupna verzija

Frontend aplikacija:
https://eduplusfrontend-7g1zwv814-romansimunovics-projects.vercel.app/#/login

Backend API:
https://eduplus-backend.onrender.com/api

Projekt EdukatorPlus je izrađen kao završni rad iz kolegija Informacijsko-komunikacijska infrastruktura na Filozofskom fakultetu u Osijeku pod mentorstvom izv. prof. dr. sc. Tomislava Jakopeca.

Dio dokumentacije i koda izrađen je uz pomoć alata ChatGPT Plus.

Autor:Roman Šimunović,  Filozofski fakultet Osijek
