# Krzyżówka Duel, konfiguracja i publikacja

Notatki techniczne dla osoby, która wdraża i utrzymuje grę. Instrukcja dla graczy jest w `README.md`.

## Przegląd

Gra to statyczna strona bez budowania i bez zależności z npm. Cały interfejs, style, ustawienia, poziomy i logika są w jednym pliku `index.html`. Stan partii online trzyma Cloud Firestore, a service worker pozwala grać na jednym urządzeniu bez internetu.

| Element | Technologia |
|---|---|
| Interfejs i logika | HTML, CSS, JavaScript (moduł ES, bez frameworka) |
| Gra online | Firebase Cloud Firestore 10.12.2, ładowany z `www.gstatic.com` |
| Tryb testowy | `localStorage` i `BroadcastChannel` |
| Czcionki | Manrope (nagłówki, wyniki, litery) i Inter (tekst), z Google Fonts |
| Instalacja | PWA, czyli `manifest.webmanifest` i `sw.js` |

## Uruchomienie lokalne

Najprościej uruchomić prosty serwer w folderze z grą

```bash
python -m http.server 8000
# potem http://localhost:8000
```

Podwójne kliknięcie `index.html` też działa, ale wtedy nie ma service workera ani instalacji jako aplikacji.

## Publikacja na GitHub Pages

1. Wrzuć zawartość folderu do repozytorium (tu `sebban-games/Crossword-online`).
2. W repozytorium wejdź w **Settings → Pages**, wybierz gałąź `main` i folder `/ (root)`.
3. Po minucie gra będzie pod `https://sebban-games.github.io/Crossword-online/`. Jeśli repozytorium nazwiesz inaczej albo przeniesiesz je do innej organizacji, popraw link na początku `README.md`.
4. Przy każdej kolejnej wersji podbij nazwę `CACHE` w `sw.js` (obecnie `krzyzowka-duel-v2`, następna to `krzyzowka-duel-v3`), żeby telefony pobrały nowe pliki.

Po przeniesieniu gry na nowy adres stara zainstalowana aplikacja przestaje działać. Trzeba ją odinstalować i zainstalować z nowego linku.

## Tryb online (Firebase)

Gra używa bazy **Cloud Firestore** bez logowania. Jedna partia to jeden dokument `games/KOD`, który obaj gracze czytają i zmieniają w transakcjach. Każdy ruch jest sprawdzany w transakcji, więc dwa ruchy naraz nie nadpiszą się nawzajem, a ruch poza kolejką jest odrzucany.

Konfiguracja wymagana do gry na dwóch urządzeniach.

1. W [konsoli Firebase](https://console.firebase.google.com) użyj istniejącego projektu (obecnie `crossword-online-68520`) albo utwórz nowy.
2. **Build → Firestore Database** i utwórz bazę.
3. **Ustawienia projektu → Twoje aplikacje → Web** i skopiuj obiekt konfiguracji do stałej `FIREBASE_CONFIG` na początku skryptu w `index.html`.
4. W **Firestore Database → Rules** wklej reguły z `firestore.rules`. Pozwalają one tworzyć i zmieniać tylko dokumenty `games/KOD` z czteroznakowym kodem, nie pozwalają zmienić poziomu w trakcie gry ani niczego usuwać.

Przykład struktury stałej (wartości wstaw ze swojej konsoli)

```js
const FIREBASE_CONFIG = {
  apiKey: "TWOJ_KLUCZ_WEB",
  authDomain: "TWOJ_PROJEKT.firebaseapp.com",
  projectId: "TWOJ_PROJEKT",
  storageBucket: "TWOJ_PROJEKT.firebasestorage.app",
  messagingSenderId: "NUMER",
  appId: "IDENTYFIKATOR_APLIKACJI"
};
```

Klucz web Firebase jest z założenia widoczny w kodzie strony i nie jest hasłem. Dostęp do danych chronią reguły z `firestore.rules`, dlatego zawsze wgrywaj je razem z nową bazą.

Logowanie (Authentication) nie jest potrzebne, więc po zmianie domeny nie trzeba nic dopisywać w **Authorized domains**. Jeśli jednak w Google Cloud Console ograniczysz klucz API do konkretnych stron (**APIs & Services → Credentials → klucz → Website restrictions**), dopisz tam `https://sebban-games.github.io/*`.

Sprzątanie bazy. Reguły nie pozwalają usuwać gier z poziomu aplikacji, więc stare dokumenty zostają w kolekcji `games`. Przy domowym użyciu to nie problem, a w razie potrzeby można je usunąć ręcznie w konsoli Firebase albo ustawić regułę TTL.

Test bez Firebase (opcjonalnie). Ustaw `FIREBASE_CONFIG = null`. Gra przełączy się wtedy w tryb testowy, w którym dwie karty tej samej przeglądarki komunikują się przez `localStorage` i `BroadcastChannel`. Gra przechodzi w ten tryb także wtedy, gdy nie uda się wczytać Firebase, i pokazuje wtedy czerwony komunikat z przyczyną. Aktualny tryb widać na dole ekranu startowego (zielona kropka online, bursztynowa testowy).

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

## Wygląd (Modern Teal Signature)

Gra korzysta z systemu wizualnego Modern Teal Signature. Wszystkie kolory, promienie, cienie i czcionki są zdefiniowane jako zmienne CSS na początku bloku `<style>` w `index.html`. Nowe elementy powinny używać tych zmiennych zamiast wpisanych na sztywno kolorów.

| Grupa | Zmienne | Uwagi |
|---|---|---|
| Marka | `--teal-deep`, `--teal`, `--teal-soft`, `--teal-mist` | `#087F75`, `#13B8A6`, `#75DDD0`, `#D9F3EF` |
| Semantyka | `--ok`, `--warn`, `--bad`, `--info` | sukces, ostrzeżenie, błąd, informacja |
| Motyw | `--bg`, `--surface`, `--elev`, `--ink`, `--mut`, `--line`, `--line-strong` | osobne wartości dla jasnego i ciemnego |
| Akcent | `--accent`, `--on-accent` | główne przyciski i zaznaczenie kratki |
| Gracze | `--me`, `--op`, `--op-ink` | Ty turkus, rywal bursztyn (`--warn`) |
| Plansza | `--clue`, `--clue-ink`, `--clue-on`, `--blank`, `--hl`, `--tile`, `--tile-ink` | pola pytań, ramka, zaznaczone hasło, kafelki |
| Kształty | `--r-sm` 10px, `--r-btn` 12px, `--r-card` 16px, `--r-lg` 20px | kontrolki, przyciski, karty, okna |
| Czcionki | `--f-head` Manrope, `--f-body` Inter | wyniki, zegar i kod mają cyfry o stałej szerokości |

Ciemny motyw jest zapisany dwa razy, raz w `@media (prefers-color-scheme: dark)` dla trybu automatycznego i raz pod `:root[data-theme="dark"]` dla ręcznego wyboru. Zmieniając kolor ciemnego motywu, popraw oba bloki. Wybór motywu zapisuje się w `localStorage` pod kluczem `kd:theme`, a mały skrypt w `<head>` ustawia go przed narysowaniem strony, żeby nie było mignięcia. Ten sam kod aktualizuje znaczniki `theme-color`.

Animacje (wejście ekranów, podskok wyniku, błysk nowych liter, pasek czasu, kółko ładowania) wyłączają się same, gdy system ma włączone ograniczenie ruchu.

Ikony aplikacji są w tej samej palecie. Jeśli trzeba je przerobić, zachowaj nazwy i rozmiary plików oraz margines bezpieczny w wersji maskowalnej (zawartość w środkowych 80% obrazu).

## Tożsamość aplikacji PWA

| Pole | Wartość | Znaczenie |
|---|---|---|
| `id` | `krzyzowka-duel-sebbane3` | stały identyfikator instalacji |
| `start_url` | `./` | po publikacji `https://sebban-games.github.io/Crossword-online/` |
| `scope` | `./` | tylko folder `/Crossword-online/`, bez innych projektów z tej domeny |
| `theme_color`, `background_color` | `#F5F8F7` | tło ekranu startowego aplikacji |

Przeglądarka rozwiązuje `id` względem domeny, więc pełny identyfikator to `https://sebban-games.github.io/krzyzowka-duel-sebbane3`. **Nie zmieniaj `id`, `start_url` ani `scope`**, bo zmiana `id` sprawi, że przeglądarka uzna grę za nową aplikację, a obecne instalacje zostaną osierocone. Każdy inny projekt publikowany pod `sebban-games.github.io` musi mieć własny, inny `id` i własny `scope`, inaczej Chrome może pokazać komunikat „Ta aplikacja jest już zainstalowana” albo otworzyć nie ten projekt.

Zmiana ikon i kolorów w tej wersji nie zmienia tożsamości aplikacji. Zainstalowane kopie dostaną nowy wygląd po aktualizacji service workera, a ikonę system odświeża z opóźnieniem.

## Testowanie

Przed publikacją nowej wersji sprawdź lokalnie

1. `python -m http.server 8000` i otwórz `http://localhost:8000` w dwóch kartach.
2. W pierwszej karcie utwórz grę, w drugiej dołącz kodem. Postaw litery, zatwierdź, pomiń turę, sprawdź Cofnij.
3. Przełącz motyw przyciskiem w rogu ekranu startowego i obejrzyj menu, lobby, planszę i okno końca gry w obu motywach.
4. W narzędziach deweloperskich ustaw szerokość 360 px i 390 px oraz widok komputera, plansza powinna mieścić się bez przewijania.
5. W **DevTools → Application → Manifest** sprawdź, czy nie ma błędów, czy widać trzy ikony i czy `id` jest takie jak w tabeli wyżej.

Po publikacji sprawdź

1. Plik `https://sebban-games.github.io/Crossword-online/manifest.webmanifest`, czy serwowana wersja ma właściwe `id`, `start_url` i `scope`.
2. W **Application → Service workers**, czy aktywna jest nowa nazwa `CACHE`.
3. Instalację w Chrome na Androidzie i komputerze, także obok innych zainstalowanych projektów z tej domeny. Każdy powinien instalować się osobno i otwierać swoją stronę.
4. Grę online na dwóch różnych urządzeniach. Na dole ekranu startowego powinna świecić zielona kropka.

## Rozwiązywanie problemów

| Objaw | Przyczyna i rozwiązanie |
|---|---|
| Telefon pokazuje stary wygląd | GitHub Pages trzyma pliki w pamięci podręcznej do około 10 minut, a bez internetu gra używa zapisanej kopii. Odczekaj chwilę, uruchom grę z internetem i sprawdź, czy podbito nazwę `CACHE` w `sw.js`. |
| Bursztynowa kropka i komunikat „Firebase nie działa” | Brak internetu, zablokowany `www.gstatic.com` albo błędna `FIREBASE_CONFIG`. Treść komunikatu podaje przyczynę. |
| „Ta gra pochodzi ze starej wersji” | Dokument gry nie ma pola `racks`. Wystarczy utworzyć nową grę. |
| „Ta aplikacja jest już zainstalowana” przy innym projekcie | Dwa projekty mają ten sam `id` w manifeście. Nadaj drugiemu projektowi własny `id`. |
| Brak uprawnień przy zapisie ruchu | Reguły Firestore nie są wgrane albo zostały zmienione. Wklej ponownie `firestore.rules`. |

## Wersje i aktualizacje

* Wersję plików offline wyznacza nazwa `CACHE` w `sw.js`. Obecna wersja to `krzyzowka-duel-v2` (nowy wygląd Modern Teal Signature, nowe ikony, kopiowanie kodu, pasek czasu, przełącznik motywu).
* Po zmianie dowolnego pliku podbij numer o jeden.
* Zmiana formatu dokumentu gry w Firestore wymaga sprawdzenia `firestore.rules` i komunikatu dla starych gier w funkcji `enter`.

## Struktura

```
index.html              cała gra, czyli ekrany, style i tokeny wyglądu, ustawienia, poziomy i logika
sw.js                   service worker (najpierw sieć, bez sieci kopia z pamięci, czcionki z pamięci)
manifest.webmanifest    PWA, tożsamość, nazwa, kolory, ikony
icon-192.png, icon-512.png            ikony aplikacji z zaokrąglonymi rogami
icon-maskable-512.png                 ikona maskowalna dla Androida (pełne tło)
apple-touch-icon.png                  ikona 180 × 180 dla ekranu początkowego iPhone'a
firestore.rules         reguły bazy Firestore
README.md               instrukcja dla graczy
KONFIGURACJA.md         ten plik
```
