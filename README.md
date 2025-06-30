# EdukatorPlus Frontend

**EdukatorPlus** frontend je React aplikacija koja omogućuje korisniku upravljanje edukacijskim radionicama i evidenciju polaznika putem REST API-ja.

Frontend implementira sve funkcionalnosti backend API-ja kroz moderno i responzivno korisničko sučelje.

## \:sparkles: Funkcionalnosti

* Dodavanje, prikaz i brisanje entiteta (Radionice, Polaznici, Prisustva)
* Pretraživanje, sortiranje i filtriranje po raznim kriterijima
* Statistika prisustva (po statusu i radionici)
* Validacija korisničkih unosa i obavijesti o greškama
* Minimalističan dizajn s osnovnim CSS-om

## \:gear: Tehnologije

* React (JavaScript)
* JSX
* CSS
* Fetch API

## \:hammer\_and\_wrench: Pokretanje projekta

```bash
npm install
npm start
```

Frontend se pokreće lokalno na:

```
http://localhost:3000
```

## \:earth\_africa: Deploy

Frontend Render URL:

```
https://eduplusfrontend.onrender.com
```

## \:file\_folder: Struktura komponenti

* `Radionice.jsx` - Upravljanje radionicama
* `Polaznici.jsx` - Upravljanje korisnicima
* `Prisustva.jsx` - Evidencija prisustva s filtrima i statistikama

## \:link: Povezivanje s backendom

Svi pozivi prema API-ju upućuju se na bazni URL:

```js
const baseUrl = "https://eduplusbackend.onrender.com";
```

## \:mortar\_board: Akademski kontekst

Ova aplikacija je izrađena kao završni projekt u sklopu kolegija **Informacijsko-komunikacijska infrastruktura** pod mentorstvom **izv. prof. dr. sc. Tomislava Jakopeca**, uz dodatnu primjenu znanja iz kolegija **Programiranje 2 (P2)**.
