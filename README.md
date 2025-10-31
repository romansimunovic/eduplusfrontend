EdukatorPlus

EdukatorPlus je web aplikacija razvijena za jednostavno vođenje edukacijskih radionica, polaznika i evidencije prisustva.
Sastoji se od React frontend dijela i Spring Boot backend dijela povezanog s PostgreSQL bazom podataka.

Aplikacija omogućuje unos, uređivanje i brisanje radionica i polaznika, vođenje prisustva po radionici te prikaz statistike prisustva u stvarnom vremenu.
Sučelje je jednostavno i responzivno, prilagođeno mobilnim i desktop uređajima.

Glavne funkcionalnosti

Pregled, dodavanje, uređivanje i brisanje radionica i polaznika

Evidencija prisustva po radionici s prikazom statusa (prisutan, izostao, odustao, nepoznato)

Pretraživanje i filtriranje podataka

Prikaz statistike prisustva

Generiranje testnih podataka pomoću Faker biblioteke

Sučelje prilagođeno različitim veličinama ekrana

Tehnologije i alati

Frontend:

React

CSS

Fetch API

Backend:

Java (Spring Boot, Spring Security, JPA)

PostgreSQL (Neon)

Render (hosting backend servisa)

Ostalo:

Vercel (hosting frontenda)

Faker biblioteka za generiranje testnih podataka

JWT autentifikacija i autorizacija

Struktura projekta
EdukatorPlus/
├── eduplusfrontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api.js
│   │   └── index.js
│   ├── .env.production
│   ├── package.json
│   └── README.md
│
└── eduplusbackend/
    ├── src/
    │   ├── main/java/com/edukatorplus/
    │   │   ├── config/
    │   │   ├── controller/
    │   │   ├── model/
    │   │   ├── repository/
    │   │   ├── service/
    │   │   └── Start.java
    │   └── resources/
    │       ├── application.yml
    │       ├── application-prod.yml
    ├── pom.xml
    └── README.md

Pokretanje projekta lokalno
Frontend

Klonirati repozitorij i otvoriti frontend mapu:

git clone https://github.com/romansimunovic/eduplusfrontend.git
cd eduplusfrontend


Instalirati ovisnosti:

npm install


Pokrenuti razvojni server:

npm start


Aplikacija će se otvoriti na adresi:
http://localhost:3000

Backend

Klonirati backend dio:

git clone https://github.com/romansimunovic/eduplusbackend.git
cd eduplusbackend


Pokrenuti aplikaciju pomoću Mavena:

mvn spring-boot:run


Backend se pokreće na adresi:
http://localhost:8080

Deploy i hosting

Frontend: Vercel

Backend: Render

Baza podataka: Neon PostgreSQL

Aplikacija koristi SSL vezu prema bazi (?sslmode=require) i povezana je putem REST API endpointa:
https://eduplus-backend.onrender.com/api

Frontend koristi .env.production s definiranom varijablom:

REACT_APP_API_BASE=https://eduplus-backend.onrender.com
REACT_APP_ENABLE_SEED=false

Dostupna verzija

Frontend aplikacija dostupna je na:
https://eduplusfrontend-7g1zwv814-romansimunovics-projects.vercel.app/#/login

Backend API hostan je na Renderu i povezan s Neon bazom podataka.

O projektu

Aplikacija EdukatorPlus izrađena je kao završni rad iz kolegija Informacijsko-komunikacijska infrastruktura
na Filozofskom fakultetu u Osijeku pod mentorstvom izv. prof. dr. sc. Tomislava Jakopeca.

Tijekom razvoja korištene su moderne web tehnologije, a dio koda i dokumentacije izrađen je uz pomoć alata ChatGPT Plus.

Autor

Roman Šimunović
Filozofski fakultet Osijek
Kontakt: roman.simunovic@ffos.hr

GitHub: github.com/romansimunovic
