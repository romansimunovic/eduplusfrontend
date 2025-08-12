
# EdukatorPlus – Frontend

**EdukatorPlus** je React aplikacija koja služi za upravljanje edukacijskim radionicama, polaznicima i njihovim prisustvom.  
Ideja je bila napraviti pregledno i jednostavno sučelje koje se povezuje na backend putem REST API-ja, s mogućnošću pregleda, dodavanja, uređivanja i brisanja podataka – sve u realnom vremenu.

## Što aplikacija radi?

- Prikazuje i upravlja popisom radionica, polaznika i prisustava
- Omogućuje dodavanje, uređivanje i brisanje zapisa
- Filtriranje i pretraživanje po imenu, radionici ili statusu prisustva
- Prikaz statistike prisustva po statusima
- Automatsko generiranje demo podataka
- Minimalistički i responzivan dizajn

## Tehnologije

- **React** (JavaScript + JSX)
- **CSS** za osnovno stiliziranje
- **Fetch API** za komunikaciju s backendom
- **Render** za hosting frontenda i backenda

## Pokretanje projekta lokalno

1. Kloniraj repozitorij  
   ```bash
   git clone https://github.com/korisnik/edukatorplus-frontend.git
   cd edukatorplus-frontend

	2.	Instaliraj ovisnosti

npm install


	3.	Pokreni aplikaciju

npm start


	4.	Otvori u pregledniku:

http://localhost:3000

Deploy

Frontend je dostupan na:
🔗 https://eduplusfrontend.onrender.com

Backend API se nalazi na:
🔗 https://eduplusbackend.onrender.com

Rad s granama

Zbog razlike između lokalne verzije (s login/registracijom) i produkcijske verzije (bez toga), koristi se rad s Git granama:
	•	main – stabilna verzija aplikacije na Renderu (bez login/registracije)
	•	dev – razvojna verzija s login/registracijom i novim funkcionalnostima

📂 Struktura komponenti

	•	Home.jsx – Početna stranica s popisom radionica i polaznika
	•	Radionice.jsx – Upravljanje radionicama
	•	Polaznici.jsx – Upravljanje polaznicima
	•	Prisustva.jsx – Evidencija prisustva s filtrima i statistikama
	•	Login.jsx / Register.jsx – Prijava i registracija korisnika (dev grana)

Projekt je izrađen kao završni rad iz kolegija Informacijsko-komunikacijska infrastruktura
pod mentorstvom izv. prof. dr. sc. Tomislava Jakopeca, uz dodatnu primjenu znanja iz kolegija Programiranje 2 (P2).