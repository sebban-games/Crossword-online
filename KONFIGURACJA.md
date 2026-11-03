# Crossword Duel, konfiguracja i publikacja

Notatki techniczne dla osoby, która wdraża grę. Instrukcja dla graczy jest w `README.md`.

## Uruchomienie lokalne

Pliki to zwykły statyczny serwis bez budowania. Najprościej

```bash
python -m http.server 8000
# potem http://localhost:8000
```

Podwójne kliknięcie `index.html` też działa w trybie lokalnym, ale wtedy nie ma service workera ani instalacji jako aplikacji.

## Publikacja na GitHub Pages

1. Wrzuć zawartość folderu do repozytorium (tu `sebban-games/Crossword-online`).
2. W repozytorium wejdź w **Settings → Pages**, wybierz gałąź `main` i folder `/ (root)`.
3. Po minucie gra będzie pod `https://sebban-games.github.io/Crossword-online/`. Jeśli repozytorium nazwiesz inaczej albo przeniesiesz je do innej organizacji, popraw link na początku `README.md`.
4. Przy każdej kolejnej wersji podbij nazwę `CACHE` w `sw.js` (np. `krzyzowka-duel-v2`), żeby telefony pobrały nowe pliki.

Po przeniesieniu gry na nowy adres stara zainstalowana aplikacja przestaje działać. Trzeba ją odinstalować i zainstalować z nowego linku.

## Tryb online (Firebase)

Gra używa bazy **Cloud Firestore** bez logowania. Jedna partia to jeden dokument `games/KOD`, który obaj gracze czytają i zmieniają w transakcjach. Każdy ruch jest sprawdzany w transakcji, więc dwa ruchy naraz nie nadpiszą się nawzajem, a ruch poza kolejką jest odrzucany.

1. W [konsoli Firebase](https://console.firebase.google.com) użyj istniejącego projektu (obecnie `crossword-online-68520`) albo utwórz nowy.
2. **Build → Firestore Database** i utwórz bazę.
3. **Ustawienia projektu → Twoje aplikacje → Web** i skopiuj obiekt konfiguracji do stałej `FIREBASE_CONFIG` na początku skryptu w `index.html`.
4. W **Firestore Database → Rules** wklej reguły z `firestore.rules`. Pozwalają one tworzyć i zmieniać tylko dokumenty `games/KOD` z czteroznakowym kodem, nie pozwalają zmienić poziomu w trakcie gry ani niczego usuwać.

Logowanie (Authentication) nie jest potrzebne, więc po zmianie domeny nie trzeba nic dopisywać w **Authorized domains**. Jeśli jednak w Google Cloud Console ograniczysz klucz API do konkretnych stron (**APIs & Services → Credentials → klucz → Website restrictions**), dopisz tam `https://sebban-games.github.io/*`.

Sprzątanie bazy. Reguły nie pozwalają usuwać gier z poziomu aplikacji, więc stare dokumenty zostają w kolekcji `games`. Przy domowym użyciu to nie problem, a w razie potrzeby można je usunąć ręcznie w konsoli Firebase albo ustawić regułę TTL.

Test bez Firebase. Ustaw `FIREBASE_CONFIG = null`. Gra przełączy się wtedy w tryb testowy, w którym dwie karty tej samej przeglądarki komunikują się przez `localStorage` i `BroadcastChannel`. Aktualny tryb (online albo testowy) widać na dole ekranu startowego.

## Zasady i balans

Wszystkie wartości są w sekcji `USTAWIENIA` na początku skryptu w `index.html`.

| Element | Wartość |
|---|---|
| Czas na turę (`TURNS`) | 15, 30, 45, 60, 90, 120, 180 s, domyślnie 120 (`DEFAULT_TURN`) |
| Zestaw liter (`RACK`) | 5 liter, losowanych z brakujących na całej planszy |
| Dobra litera | +1 |
| Zła litera | −1, litera przepada |
| Premia za hasło | do 3 liter 2, do 5 liter 4, do 7 liter 7, dłuższe 10 |
| Seria czystych tur | od 2. tury z rzędu +3, potem +5, +7, maksymalnie +9 |
| Podpowiedź (`idleTurns`) | po 4 turach z najwyżej jedną trafioną literą |
| Brak rywala | tura przepada po czasie tury plus 15 s |

## Poziomy

Plansze są w tablicy `LEVELS`. Każdy poziom ma numer `n`, nazwę, wymiary `W` i `H` (z ramką pytań, więc pole gry jest o 1 mniejsze w każdym kierunku), siatkę `G` i listę haseł `s`.

Siatka to wiersze znaków. `#` to pole z pytaniem albo puste pole ramki, a `.` to kratka na literę. Każde hasło w `s` ma postać

```js
[kierunek, wiersz, kolumna, "HASŁO", "pytanie"]
```

gdzie `0` oznacza hasło poziome, a `1` pionowe. Wiersz i kolumna wskazują pierwszą literę. Pytanie może być krótkim tekstem albo samym emoji, które gra wyświetli większe.

| Poziom | Nazwa | Pole gry |
|---|---|---|
| 1 | Rozgrzewka | 6 × 7 |
| 2 | Łatwy | 6 × 7 |
| 3 | Średni | 7 × 8 |
| 4 | Wymagający | 7 × 8 |
| 5 | Trudny | 7 × 9 |
| 6 | Ekspert | 7 × 9 |

Przy dodawaniu poziomu sprawdź, czy litery haseł krzyżujących się w tej samej kratce są zgodne, bo gra bierze rozwiązanie kratki z ostatniego hasła, które ją przecina.

## Struktura

```
index.html              cała gra, czyli ekrany, style, ustawienia, poziomy i logika
sw.js                   service worker (najpierw sieć, bez sieci kopia z pamięci)
manifest.webmanifest    PWA, nazwa, kolory, ikony
icon-192.png, icon-512.png, icon-maskable-512.png   ikony aplikacji
firestore.rules         reguły bazy Firestore
```
