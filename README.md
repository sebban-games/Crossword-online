# Krzyżówka Duel, instrukcja gry

Turowa krzyżówka panoramiczna dla dwóch osób. Na zmianę dopisujecie litery do wspólnej planszy i zbieracie punkty za trafienia i dokończone hasła. Każdy gra na swoim urządzeniu albo oboje na jednym telefonie.

**Otwórz grę** https://sebban-games.github.io/Crossword-online/

## Start gry

1. Obie osoby otwierają ten sam adres gry i wpisują swoje imię. Gra zapamiętuje je na kolejne partie.
2. Pierwsza osoba wybiera poziom i czas na turę, potem klika **Utwórz grę i pokaż kod**.
3. Na ekranie pojawia się czteroliterowy kod. Przycisk **Kopiuj kod** kopiuje go do schowka, więc łatwo wysłać go rywalowi w wiadomości.
4. Druga osoba wpisuje kod w polu **Dołącz do gry** i klika **Dołącz** (albo naciska Enter). Gra startuje sama i losuje, kto zaczyna.

Podczas łączenia z serwerem przycisk pokazuje kółko ładowania. Jeśli coś pójdzie nie tak, pod formularzem pojawi się czerwony komunikat z opisem problemu.

Poziomów jest sześć, od najmniejszej planszy do największej. Kropki pod nazwą pokazują trudność.

| Poziom | Plansza |
|---|---|
| Rozgrzewka | 6 × 7 |
| Łatwy | 6 × 7 |
| Średni | 7 × 8 |
| Wymagający | 7 × 8 |
| Trudny | 7 × 9 |
| Ekspert | 7 × 9 |

## Ekran gry

* Na górze widać imiona i wyniki obu graczy. Twój kolor to turkus, kolor rywala to bursztyn. Ten sam kolor ma pasek na dole każdej litery, którą dany gracz położył na planszy.
* Pole wyniku osoby, która ma teraz ruch, jest podświetlone, a przy każdej zmianie punktów wynik lekko „podskakuje”.
* Pod zegarem jest pasek, który kurczy się wraz z upływem czasu tury. W ostatnich sekundach zegar i pasek zmieniają kolor na czerwony.
* Pod planszą jest pasek z pytaniem do zaznaczonego hasła i liczbą jego liter.

## Animacje i dźwięki

Gra reaguje na każde wydarzenie animacją i krótkim dźwiękiem.

* **Start gry.** Plansza pojawia się kaskadą, a gracz z pierwszym ruchem dostaje rozdane litery.
* **Ruch.** Po zatwierdzeniu nowe litery obracają się jak kafelki, jedna po drugiej, z rosnącym dźwiękiem dzwonka. Nad każdą trafioną literą wyskakuje +1. Zła litera pojawia się na czerwono, trzęsie się i znika z −1.
* **Dokończone hasło.** Litery hasła przechodzą falą, gra odtwarza melodyjkę, a na górze pojawia się napis z hasłem i premią.
* **Seria.** Premię za serię czystych tur ogłasza osobny napis i dźwięk.
* **Wynik.** Liczba punktów nalicza się płynnie, a obok pola wyniku wyskakuje zdobyta liczba.
* **Zmiana tury.** Napis „Twój ruch” z dźwiękiem i krótką wibracją, gdy przychodzi Twoja kolej. Na jednym urządzeniu napis mówi, który gracz teraz gra.
* **Ostatnie 5 sekund.** Zegar pulsuje i tyka.
* **Podpowiedź.** Litery podpowiedzi delikatnie pulsują na planszy.
* **Koniec gry.** Wygrana kończy się konfetti i fanfarą, a wyniki naliczają się w oknie podsumowania.

Przycisk z głośnikiem w prawym górnym rogu ekranu startowego (i obok przycisku Menu w trakcie gry) wyłącza oraz włącza dźwięki i wibracje. Wybór jest zapamiętywany. Na iPhonie dźwięków nie słychać, gdy telefon jest wyciszony przełącznikiem z boku. Wibracje działają tylko na Androidzie. Jeśli w systemie włączone jest ograniczenie ruchu, gra pomija ruchome animacje i konfetti.

## Przebieg tury

Gracz na swojej turze ma trzy możliwości.

* **Zatwierdź** zapisuje litery, które postawiłeś na planszy, i oddaje turę rywalowi.
* **Cofnij** zdejmuje wszystkie litery postawione w tej turze, żeby ułożyć je od nowa.
* **Pomiń** oddaje turę bez ruchu. Twój zestaw liter zostaje bez zmian.

Zasady stawiania liter.

* Każdy gracz ma swój zestaw 5 liter, losowanych z tych, których brakuje na całej planszy (nie tylko w jednym haśle).
* Klikasz kratkę, potem literę z zestawu (albo odwrotnie). Kliknięcie pytania na planszy zaznacza całe hasło, a ponowne kliknięcie tej samej kratki zmienia kierunek z poziomego na pionowy.
* Postawione, jeszcze niezatwierdzone litery mają przerywaną ramkę. Kliknięcie takiej kratki zdejmuje literę.
* Litery, których nie użyjesz, zostają Ci na kolejną turę. Na początku następnej tury brakujące litery są dolosowywane do pięciu.
* Litera z zestawu przepada tylko wtedy, gdy na planszy nie ma już żadnego wolnego pola, w które pasuje.

Czas na turę wybiera osoba tworząca grę. Do wyboru jest 15, 30, 45, 60, 90, 120 lub 180 sekund (domyślnie 120). Gdy czas się skończy, ruch zatwierdza się sam z literami, które zdążysz postawić. Jeśli rywal zniknie, jego tura przepada po czasie tury plus 15 sekund.

## Punktacja

* Dobra litera daje +1 pkt, zła −1 pkt. Zła litera nie zostaje na planszy i przepada z zestawu.
* Dokończenie hasła daje premię zależną od długości. Hasło do 3 liter daje 2 pkt, do 5 liter 4 pkt, do 7 liter 7 pkt, dłuższe 10 pkt.
* Wykorzystanie całego zestawu bez błędu dwie tury z rzędu daje +3 pkt. Każda kolejna taka tura daje +5, +7, a potem maksymalnie +9 pkt.
* Gra kończy się, gdy cała plansza jest wypełniona. Wygrywa osoba z większą liczbą punktów.

## Podpowiedź

Po 4 turach z rzędu, w których trafiono najwyżej jedną literę, gra pokazuje obu graczom jedno hasło bladymi, turkusowymi literami na planszy.

## Gra na jednym urządzeniu

Na ekranie startowym wybierz **Gra na jednym urządzeniu**. Gracze podają sobie telefon. Gracz 1 jest zawsze po lewej i ma kolor turkusowy, Gracz 2 zawsze po prawej i ma kolor bursztynowy. Pozycje się nie zamieniają. Podświetla się tylko pole wyniku osoby, która ma ruch, a pod zegarem widać napis „Tura: Gracz 1” albo „Tura: Gracz 2”.

## Sterowanie z klawiatury

* **Litera** stawia literę z Twojego zestawu w zaznaczonej kratce.
* **Strzałki** przesuwają zaznaczenie wzdłuż hasła.
* **Backspace** zdejmuje ostatnią postawioną literę.
* **Enter** zatwierdza ruch.

Klawiatura działa tylko na Twojej turze. Na komputerze plansza i panel z literami stoją obok siebie, na telefonie jedno pod drugim.

## Jasny i ciemny motyw

Przycisk w prawym górnym rogu ekranu startowego przełącza motyw w kolejności automatyczny, jasny, ciemny. Automatyczny dopasowuje się do ustawień telefonu lub komputera. Wybór jest zapamiętywany w tej przeglądarce.

## Instalacja na telefonie i komputerze

Najprościej użyć przycisku **Zainstaluj** na ekranie startowym, pod nazwą gry. Przycisk znika, gdy gra jest już zainstalowana albo otwarta jako aplikacja.

### Android i komputer (Chrome, Edge)

1. Otwórz link do gry.
2. Kliknij **Zainstaluj** na ekranie startowym i potwierdź w oknie przeglądarki.
3. Pojawi się turkusowa ikona z kafelkami, otwierana na pełnym ekranie.

Jeśli przycisku nie widać, przeglądarka jeszcze nie uznała strony za gotową do instalacji. Odśwież stronę albo wybierz w menu ⋮ „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”.

### iPhone (Safari)

Na iPhonie przeglądarka nie ma okna instalacji, więc przycisk **Zainstaluj** pokazuje instrukcję.

1. Otwórz link w Safari.
2. Stuknij ikonę „Udostępnij” (kwadrat ze strzałką).
3. Wybierz „Dodaj do ekranu początkowego” i potwierdź przyciskiem „Dodaj”.

Jeśli masz już zainstalowaną grę z tego adresu, nie musisz jej instalować ponownie. Nowy wygląd pobierze się sam przy pierwszym uruchomieniu z internetem. Ikona na ekranie głównym może zmienić się na turkusową z opóźnieniem, bo telefon odświeża ją we własnym tempie.

Jeśli masz zainstalowaną starą wersję spod adresu sebban03.github.io, odinstaluj ją i zainstaluj grę ponownie z nowego linku.

Gra na jednym urządzeniu działa bez internetu po pierwszym wczytaniu. Gra na dwóch urządzeniach wymaga internetu. Na dole ekranu startowego widać tryb gry. Zielona kropka oznacza tryb online, a bursztynowa tryb testowy, w którym gra z drugim urządzeniem nie działa.

## Dane

Imię, ostatnio wybrany poziom, czas na turę, motyw i ustawienie dźwięku są zapisane **lokalnie w tej przeglądarce**. Przebieg gry online jest zapisany na serwerze pod kodem gry, więc po odświeżeniu strony w tej samej karcie gra wraca sama. Do gry online nie trzeba zakładać konta. Gra loguje przeglądarkę anonimowo, bez adresu e-mail i bez danych osobowych, tylko po to, żeby partię mogli zmieniać wyłącznie jej dwaj gracze. Zamknięcie karty kończy Twój udział w tej partii.
