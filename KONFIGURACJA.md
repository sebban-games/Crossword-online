# Krzyżówka Duel, konfiguracja i publikacja

Notatki techniczne dla osoby, która wdraża i utrzymuje grę. Instrukcja dla graczy jest w `README.md`.

## Przegląd

Gra to statyczna strona bez budowania i bez zależności z npm. Cały interfejs, style, ustawienia, poziomy i logika są w jednym pliku `index.html`. Stan partii online trzyma Cloud Firestore, a service worker pozwala grać na jednym urządzeniu bez internetu.

| Element | Technologia |
|---|---|
| Interfejs i logika | HTML, CSS, JavaScript (moduł ES, bez frameworka) |
| Gra online | Firebase 10.12.2 (Firestore, anonimowe logowanie, opcjonalnie App Check), ładowany z `www.gstatic.com` |
| Testy reguł | `@firebase/rules-unit-testing` i emulator Firestore (folder `testy/`, tylko do sprawdzania) |
| Tryb testowy | `localStorage` i `BroadcastChannel` |
| Czcionki | Manrope (nagłówki, wyniki, litery) i Inter (tekst), z Google Fonts |
| Instalacja | PWA, czyli `manifest.webmanifest` i `sw.js` |
| Dźwięki | Web Audio API, wszystkie dźwięki są syntezowane w przeglądarce, bez plików audio |

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
4. Przy każdej kolejnej wersji podbij nazwę `CACHE` w `sw.js` (obecnie `krzyzowka-duel-v4`, następna to `krzyzowka-duel-v5`), żeby telefony pobrały nowe pliki.

Po przeniesieniu gry na nowy adres stara zainstalowana aplikacja przestaje działać. Trzeba ją odinstalować i zainstalować z nowego linku.

## Tryb online (Firebase)

Gra używa bazy **Cloud Firestore** i **anonimowego logowania** z Firebase Authentication. Gracz nie zakłada konta i nic nie wpisuje, a przeglądarka dostaje po prostu niewidoczny identyfikator. Jedna partia to jeden dokument `games/KOD`, w którym przy każdym graczu zapisany jest jego identyfikator (`p[0].u`, `p[1].u`). Każdy ruch jest zapisywany w transakcji, więc dwa ruchy naraz nie nadpiszą się nawzajem.

### Konfiguracja wymagana do gry na dwóch urządzeniach

1. W [konsoli Firebase](https://console.firebase.google.com) użyj istniejącego projektu (obecnie `crossword-online-68520`) albo utwórz nowy.
2. **Build → Firestore Database** i utwórz bazę.
3. **Build → Authentication → Sign-in method** i włącz dostawcę **Anonymous**. Bez tego gra pokaże komunikat „logowanie anonimowe jest wyłączone w konsoli Firebase” i przejdzie w tryb testowy.
4. W **Authentication → Settings → Authorized domains** dopisz `sebban-games.github.io`.
5. **Ustawienia projektu → Twoje aplikacje → Web** i skopiuj obiekt konfiguracji do stałej `FIREBASE_CONFIG` na początku skryptu w `index.html`.
6. W **Firestore Database → Rules** wklej reguły z `firestore.rules` i kliknij **Publish**. Edytor w konsoli od razu pokaże ewentualny błąd składni.

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

### Kolejność przy wdrażaniu tej wersji

Nowe reguły wymagają identyfikatora gracza, którego stara wersja gry nie zapisuje. Dlatego

1. najpierw włącz logowanie anonimowe (krok 3 wyżej),
2. potem opublikuj nowe pliki gry na GitHub Pages i odczekaj kilka minut,
3. na końcu opublikuj nowe `firestore.rules`.

Gry rozpoczęte przed zmianą reguł nie dadzą się dokończyć, trzeba utworzyć nowe.

### Co chronią reguły

| Zagrożenie | Ochrona |
|---|---|
| Ktoś zmienia wynik albo planszę w cudzej grze | Grę może zmieniać tylko jeden z dwóch zapisanych w niej graczy. |
| Ktoś przegląda listę wszystkich gier i ich kody | Listowanie kolekcji `games` jest zablokowane, da się odczytać tylko grę, której kod się zna. |
| Ktoś zapisuje ogromne dane albo dodatkowe pola | Dozwolone są tylko pola, których używa gra, z ograniczoną długością. Jedna gra waży około 0,5 KB. |
| Gracz dopisuje sobie punkty | Jeden ruch może zmienić wynik tylko osoby, która ma ruch, najwyżej o +120 albo −5 pkt, a tura może iść tylko o jeden krok do przodu. |
| Zmiana poziomu, czasu tury albo gry po jej końcu | Te pola są zablokowane, a zakończonej gry nie da się już zmienić. |
| Usuwanie gier | Zablokowane dla wszystkich. |

Czego reguły nie blokują. Ktoś, kto napisze własny skrypt, może dalej tworzyć nowe, puste gry. Każda waży jednak tylko około 0,5 KB, a darmowy plan pozwala na 20 000 zapisów dziennie, więc dzienny limit zapisów zatrzyma go na długo przed zapełnieniem 1 GiB miejsca. Na planie Spark najgorszy skutek to wyłączenie gry online do odnowienia limitu, bez żadnych kosztów. Na planie Blaze ustaw alert budżetu w Google Cloud. Tę lukę zamyka App Check opisany niżej.

### App Check (opcjonalnie, mocniejsza ochrona)

App Check sprawia, że baza przyjmuje zapytania tylko z Twojej strony, a nie z cudzych skryptów.

1. Zarejestruj stronę w reCAPTCHA v3 (domena `sebban-games.github.io`) i zapisz oba klucze, klucz witryny i klucz tajny.
2. W konsoli Firebase wejdź w **App Check**, wybierz aplikację web, dostawcę reCAPTCHA v3 i wklej klucz tajny. Klucza tajnego nigdy nie wpisuj do plików gry.
3. W `index.html` wpisz klucz witryny do stałej `APP_CHECK_SITE_KEY` zamiast `null`.
4. Opublikuj grę, odczekaj kilka minut i sprawdź w zakładce App Check, że zapytania są oznaczone jako zweryfikowane.
5. Dopiero wtedy włącz **Enforce** dla Cloud Firestore i Authentication.

Jeśli włączysz Enforce bez klucza w `index.html`, gra online przestanie działać. Na `localhost` App Check z reCAPTCHA nie przechodzi bez tokenu debugowania, więc do testów lokalnych zostaw `APP_CHECK_SITE_KEY = null` albo użyj trybu testowego.

### Pozostałe ustawienia

Jeśli w Google Cloud Console ograniczysz klucz API do konkretnych stron (**APIs & Services → Credentials → klucz → Website restrictions**), dopisz tam `https://sebban-games.github.io/*`. To utrudnia nadużycia, ale nie zastępuje reguł ani App Check.

Sprzątanie bazy. Reguły nie pozwalają usuwać gier z poziomu aplikacji, więc stare dokumenty zostają w kolekcji `games`. Przy domowym użyciu to nie problem, a w razie potrzeby można je usunąć ręcznie w konsoli Firebase. Automatyczne kasowanie (TTL) wymaga planu z płatnościami.

Test bez Firebase (opcjonalnie). Ustaw `FIREBASE_CONFIG = null`. Gra przełączy się wtedy w tryb testowy, w którym dwie karty tej samej przeglądarki komunikują się przez `localStorage` i `BroadcastChannel`. Gra przechodzi w ten tryb także wtedy, gdy nie uda się wczytać Firebase albo zalogować, i pokazuje wtedy czerwony komunikat z przyczyną. Aktualny tryb widać na dole ekranu startowego (zielona kropka online, bursztynowa testowy).

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

Ruchome animacje i konfetti wyłączają się same, gdy system ma włączone ograniczenie ruchu. Opis efektów jest w sekcji niżej.

Ikony aplikacji są w tej samej palecie. Jeśli trzeba je przerobić, zachowaj nazwy i rozmiary plików oraz margines bezpieczny w wersji maskowalnej (zawartość w środkowych 80% obrazu).

## Animacje i dźwięki

Efekty są w `index.html` w sekcjach `DŹWIĘKI` i `EFEKTY WIZUALNE` skryptu oraz w bloku CSS `EFEKTY · animacje gry`. Nie wpływają na logikę gry ani na dane w Firestore.

### Jak to działa

Funkcja `fx(old, oldPend, oldRack, g)` porównuje stan gry przed i po ruchu. Wylicza nowe litery, złe litery (tylko u osoby, która wykonała ruch, bo zła litera nie trafia do bazy), dokończone hasła, serię, podpowiedź i koniec gry. Przed odświeżeniem planszy ustawia klasy i opóźnienia animacji, a po nim odtwarza dźwięki, napisy i liczby w odpowiedniej kolejności. Dzięki temu oba urządzenia pokazują ten sam przebieg ruchu.

| Element | Gdzie | Uwagi |
|---|---|---|
| Dźwięki | obiekt `SFX` | `tap`, `select`, `place`, `undo`, `correct`, `wrong`, `word`, `streak`, `turn`, `tick`, `timeout`, `start`, `join`, `hint`, `win`, `lose`, `draw` |
| Głośność | `out.gain.value` w `SFX` | domyślnie 0,55 |
| Napisy w trakcie gry | `toast(tekst, rodzaj, dźwięk, czas)` | rodzaje `turn`, `start`, `word`, `streak`, `hint`, `bad`, `mut`. Nowy ruch czyści kolejkę starych napisów |
| Liczby nad planszą | `floatAt`, `missAt` | warstwa `#fx` nad grą |
| Naliczanie wyniku | `countUp` | pole wyniku i okno końca gry |
| Konfetti | `confetti()` | płótno nad oknem końca gry, około 3 sekund |
| Wibracje | `vib()` | tylko gdy dźwięk jest włączony i przeglądarka obsługuje `navigator.vibrate` |

Okno końca gry pojawia się dopiero po animacji ostatniego ruchu (`endHold`), żeby było widać dokończone hasła. Przeglądarki pozwalają odtworzyć dźwięk dopiero po pierwszym dotknięciu strony, dlatego `SFX.unlock()` uruchamia dźwięk przy pierwszym kliknięciu lub naciśnięciu klawisza.

Ustawienie dźwięku jest w `localStorage` pod kluczem `kd:snd` (`0` oznacza wyciszenie, brak klucza oznacza dźwięk włączony).

## Gracze na ekranie

W kodzie są dwie zmienne. `me` to gracz, który steruje na danym ekranie (jego zestaw liter i przyciski), a `side` to gracz stale pokazywany po lewej stronie. W grze online oba wskazują Ciebie. Na jednym urządzeniu `me` to osoba, która ma turę, a `side` jest zawsze 0, więc Gracz 1 stoi po lewej w kolorze turkusowym, a Gracz 2 po prawej w kolorze bursztynowym. Zmienia się tylko podświetlenie pola wyniku i napis pod zegarem. Gdy gra Gracz 2, klasa `p2` na `#game` przełącza zmienne `--act` i `--act-ink`, więc jego stawiane litery i wybrany kafelek też są bursztynowe.

## Przycisk instalacji

Przycisk **Zainstaluj** (`#inst`) jest na ekranie startowym i działa tak.

| Sytuacja | Zachowanie |
|---|---|
| Chrome lub Edge zgłasza zdarzenie `beforeinstallprompt` | Przycisk się pojawia, a kliknięcie otwiera systemowe okno instalacji. Zdarzenie jest przechwytywane już w `<head>`, bo może przyjść przed resztą skryptu. |
| iPhone i iPad | Przycisk jest widoczny zawsze, a kliknięcie otwiera okno z instrukcją (`#ios`). |
| Gra uruchomiona jako aplikacja (`display-mode: standalone`) | Przycisk jest ukryty. |
| Inne przeglądarki (np. Firefox na komputerze) | Przycisk jest ukryty, bo nie da się z nich zainstalować aplikacji. |

Chrome pokazuje okno instalacji tylko dla strony przez HTTPS (albo `localhost`) z poprawnym manifestem i aktywnym service workerem. Po odrzuceniu okna Chrome może przez pewien czas nie zgłaszać zdarzenia ponownie, wtedy przycisk znika do odświeżenia strony.

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

### Testy reguł bazy

W folderze `testy/` jest gotowy test reguł z `firestore.rules`. Uruchamia lokalny emulator Firestore, więc nie dotyka prawdziwej bazy. Wymaga Node.js 20 lub nowszego i Javy 11 lub nowszej.

```bash
cd testy
npm install
npm test
```

Na końcu pojawi się liczba zaliczonych i niezaliczonych sprawdzeń. Wszystkie powinny być zaliczone. Puść test po każdej zmianie reguł albo formatu dokumentu gry. Folder `testy/` nie jest potrzebny do działania gry, można go trzymać w repozytorium.

### Gra w przeglądarce

Przed publikacją nowej wersji sprawdź lokalnie

1. `python -m http.server 8000` i otwórz `http://localhost:8000` w dwóch kartach.
2. W pierwszej karcie utwórz grę, w drugiej dołącz kodem. Postaw litery, zatwierdź, pomiń turę, sprawdź Cofnij.
3. Przełącz motyw przyciskiem w rogu ekranu startowego i obejrzyj menu, lobby, planszę i okno końca gry w obu motywach.
4. W narzędziach deweloperskich ustaw szerokość 360 px i 390 px oraz widok komputera, plansza powinna mieścić się bez przewijania.
5. Z włączonym dźwiękiem zatwierdź ruch z jedną złą literą, dokończ hasło i pozwól, żeby skończył się czas tury. Sprawdź animacje, napisy i dźwięki, a potem wycisz grę przyciskiem z głośnikiem.
6. Utwórz grę na jednym urządzeniu i zagraj kilka tur. Gracz 1 musi zostać po lewej, a Gracz 2 po prawej.
7. W **DevTools → Application → Manifest** sprawdź, czy nie ma błędów, czy widać trzy ikony i czy `id` jest takie jak w tabeli wyżej.

Po publikacji sprawdź

1. Plik `https://sebban-games.github.io/Crossword-online/manifest.webmanifest`, czy serwowana wersja ma właściwe `id`, `start_url` i `scope`.
2. W **Application → Service workers**, czy aktywna jest nowa nazwa `CACHE`.
3. Przycisk **Zainstaluj** w Chrome na Androidzie i komputerze oraz okno z instrukcją na iPhonie. Sprawdź instalację także obok innych zainstalowanych projektów z tej domeny. Każdy powinien instalować się osobno i otwierać swoją stronę.
4. Grę online na dwóch różnych urządzeniach. Na dole ekranu startowego powinna świecić zielona kropka.
5. W **Authentication → Users** powinni pojawić się anonimowi użytkownicy, a zwykła gra nie powinna pokazywać komunikatu „Błąd zapisu, ponawiam…”.

## Rozwiązywanie problemów

| Objaw | Przyczyna i rozwiązanie |
|---|---|
| Telefon pokazuje stary wygląd | GitHub Pages trzyma pliki w pamięci podręcznej do około 10 minut, a bez internetu gra używa zapisanej kopii. Odczekaj chwilę, uruchom grę z internetem i sprawdź, czy podbito nazwę `CACHE` w `sw.js`. |
| Bursztynowa kropka i komunikat „Firebase nie działa” | Brak internetu, zablokowany `www.gstatic.com` albo błędna `FIREBASE_CONFIG`. Treść komunikatu podaje przyczynę. |
| „Ta gra pochodzi ze starej wersji” | Dokument gry nie ma pola `racks`. Wystarczy utworzyć nową grę. |
| „Ta aplikacja jest już zainstalowana” przy innym projekcie | Dwa projekty mają ten sam `id` w manifeście. Nadaj drugiemu projektowi własny `id`. |
| „logowanie anonimowe jest wyłączone w konsoli Firebase” | Włącz dostawcę Anonymous w **Authentication → Sign-in method**. |
| „Błąd zapisu, ponawiam…” albo brak uprawnień przy zapisie | Gra została rozpoczęta w starej wersji albo na GitHub Pages jest jeszcze stare `index.html` bez identyfikatora gracza. Utwórz nową grę i sprawdź opublikowane pliki. Uruchom też testy z folderu `testy/`. |
| Brak dźwięku | Sprawdź przycisk z głośnikiem i głośność urządzenia. Na iPhonie dźwięk blokuje przełącznik wyciszenia. Dźwięk startuje dopiero po pierwszym dotknięciu strony. |
| Gra online przestała działać po włączeniu App Check | W `index.html` brakuje klucza `APP_CHECK_SITE_KEY` albo domena nie jest dopisana w reCAPTCHA. Wyłącz Enforce, popraw klucz i spróbuj ponownie. |

## Wersje i aktualizacje

* Wersję plików offline wyznacza nazwa `CACHE` w `sw.js`. Obecna wersja to `krzyzowka-duel-v4` (przycisk instalacji, stałe pozycje graczy na jednym urządzeniu). Wersja `krzyzowka-duel-v3` dodała animacje, dźwięki i przycisk wyciszenia. Wersja `krzyzowka-duel-v2` wprowadziła wygląd Modern Teal Signature, nowe ikony, kopiowanie kodu, pasek czasu, przełącznik motywu, anonimowe logowanie i ostrzejsze reguły bazy.
* Po zmianie dowolnego pliku podbij numer o jeden.
* Zmiana formatu dokumentu gry w Firestore wymaga sprawdzenia `firestore.rules` i komunikatu dla starych gier w funkcji `enter`.

## Struktura

```
index.html              cała gra, czyli ekrany, style i tokeny wyglądu, ustawienia, poziomy, logika, animacje i dźwięki
sw.js                   service worker (najpierw sieć, bez sieci kopia z pamięci, czcionki z pamięci)
manifest.webmanifest    PWA, tożsamość, nazwa, kolory, ikony
icon-192.png, icon-512.png            ikony aplikacji z zaokrąglonymi rogami
icon-maskable-512.png                 ikona maskowalna dla Androida (pełne tło)
apple-touch-icon.png                  ikona 180 × 180 dla ekranu początkowego iPhone'a
firestore.rules         reguły bazy Firestore
testy/                  test reguł na lokalnym emulatorze (package.json, firebase.json, reguly.test.js)
README.md               instrukcja dla graczy
KONFIGURACJA.md         ten plik
```
