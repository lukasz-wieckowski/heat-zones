# Strefy ciepła (Heat Zones)

[English](README.md)

Heat Zones zamienia głowice termostatyczne w Twoich pokojach w **strefy ciepła, które rozumieją pokoje**,
z **harmonogramem tygodniowym** jak w programowalnym termostacie. Strefa to jeden albo kilka pokoi (obszarów Home
Assistanta) grzanych jedną albo kilkoma głowicami. Wybierasz, gdzie ma być ciepło — w jednym pokoju, średnio albo
w najzimniejszym pokoju — a strefa tak steruje głowicami, żeby właśnie *tam* była temperatura docelowa.

- **Temperatura z pokoju do głowicy**: głowice z wejściem czujnika pokoju (SONOFF TRVZB / TRV-ZBT i inne) dostają
  temperaturę z pokoju; głowice bez takiego wejścia dostają cel poprawiony o różnicę między ich termometrem
  a pokojem.
- **Granice pokoi**: „salon nigdy cieplej niż 23,5 °C”, choć strefa mierzy w przedpokoju.
- **Pauza przy otwartym oknie**, **praca bez czujników** (głowice wracają na własne termometry), **powtarzanie
  zgubionych komend**, **przejmowanie zmian z pokrętła**.
- **Samonaprawa czujnika pokoju**: głowica, która po cichu wróciła na własny termometr (zdarza się po aktualizacji
  oprogramowania), zostaje przełączona z powrotem; zgłoszenie problemu dopiero, gdy to nie pomoże.
- **Strażnik zaworu**: zauważa zawór otwarty, przy którym pokój się nie nagrzewa.
- **Nauka**: różnice między pokojami, tempo nagrzewania i **model cieplny** (stygnięcie, moc grzania, temperatura
  na dworze, wiatr) — także z historii Home Assistanta.
- **Harmonogram tygodniowy** dla każdej strefy z **nagrzewaniem na zapas** (optimum start) z modelu, **ręczną
  zmianą do następnego bloku**, **trzymaniem do godziny** albo **na stałe** i **nadpisaniami na czas** (urlop,
  goście, praca z domu).
- **Karta Lovelace** z edytorem harmonogramu, dołączona i rejestrowana automatycznie.
- **Kontrakt dla innych systemów** (np. [HomeAI](https://github.com/lukasz-wieckowski/homeai)): plan na 36 godzin,
  problemy jako sygnały i usługi do odczytu i zmiany harmonogramu.

Bez chmury i bez AI — Heat Zones to termostat. Systemy takie jak HomeAI sterują nim jak każdym termostatem
i dodają nadpisania przez kontrakt opisany niżej.

## Wymagania

- Home Assistant **2026.11** lub nowszy.
- Głowice jako encje `climate` przypisane do obszarów. Czujniki temperatury w pokojach są mocno zalecane.
- Opcjonalnie: czujnik temperatury na dworze albo encja pogody z prognozą godzinową (lepsze nagrzewanie na zapas).

## Instalacja

**Przez HACS**

1. Otwórz HACS → ⋮ → *Własne repozytoria*, dodaj `https://github.com/lukasz-wieckowski/heat-zones`, kategoria
   **Integracja**.
2. Znajdź **Heat Zones** w HACS, zainstaluj i uruchom Home Assistanta ponownie.

**Ręcznie**: skopiuj `custom_components/heat_zones` do folderu `custom_components` konfiguracji i uruchom Home
Assistanta ponownie.

## Konfiguracja

*Ustawienia → Urządzenia i usługi → Dodaj integrację → Heat Zones.* Kreator pyta o opcjonalny czujnik na dworze
i pogodę i może utworzyć strefę dla każdego obszaru z termostatem.

Każda strefa to **podwpis** integracji (*Dodaj strefę*, a przy strefie ⋮ → *Zmień konfigurację*):

1. **Strefa** — nazwa, pokoje (obszary), termostaty (puste: wszystkie w tych pokojach), okna i drzwi (puste:
   wszystkie czujniki otwarcia w pokojach), pauza przy oknie i jej opóźnienie.
2. **Krok dla każdego pokoju** — czujnik temperatury (puste: czujnik ustawiony w obszarze albo znaleziony w pokoju)
   i opcjonalna granica.
3. **Tryby** — temperatury `comfort`, `eco`, `sleep` i `away` oraz własne tryby, jeden w linii (`Prysznic: 24`).
4. **Sterowanie** — jak strefa steruje głowicami (automatycznie, wejście czujnika, poprawiony cel, własny
   termometr), największa poprawka celu, nagrzewanie na zapas i jak wcześnie może się zacząć, encje towarzyszące,
   gdy nie znalazły się same.

Opcje integracji: czujnik na dworze, pogoda i **początek sezonu grzewczego** — od tego dnia grzejesz; strefy uczą
się stygnięcia z nocy przed nim, więc nagrzewanie na zapas jest dokładne od pierwszego dnia.

## Jak działa strefa

**Gdzie ma być ciepło.** `select.<strefa>_measure_at`: pokój, `average` (średnio) albo `coldest` (najzimniej).
Gdy czujnik wybranego pokoju milczy, strefa bierze pozostałe pokoje; bez żadnego odczytu z pokoi głowice wracają
na własne termometry, a strefa zgłasza problem.

**Sterowanie głowicą** (osobno dla każdej, domyślnie *automatycznie*):

| Tryb | Kiedy | Co strefa wysyła |
|---|---|---|
| Wejście czujnika pokoju | głowica ma wejście temperatury zewnętrznej (wykrywane po `unique_id`, np. `external_temperature_input` i `temperature_sensor_select` z Zigbee2MQTT) | temperaturę z pokoju (podniesioną przez pokoje z granicą) i cel strefy |
| Poprawiony cel | brak wejścia, są czujniki w pokojach | cel + (termometr głowicy − pokój), wygładzone i ograniczone (domyślnie ±3 °C) |
| Własny termometr | brak czujników w pokojach albo wybrane | cel strefy |

**Granice pokoi.** Dla każdego pokoju z granicą strefa podaje `max(punkt, T_pokoju − (granica − cel))`, więc
głowica przykręca, gdy pokój z granicą do niej dochodzi. Termostat strefy pokazuje, który pokój ogranicza
(`limited_by`), i — z nauki — najwyższą temperaturę, jaką osiągnie miejsce pomiaru (`max_reachable`).

**Pauza przy oknie.** Okno albo drzwi otwarte dłużej niż opóźnienie (domyślnie 2 min) wyłączają głowice do
zamknięcia (`binary_sensor.<strefa>_window_pause`). Długo otwarte okno przy grzaniu to też sygnał.

**Limit zaworu.** Gdy głowice mają ustawienie otwarcia zaworu, `number.<strefa>_valve_limit` ustawia je wszystkim.

## Harmonogram

Harmonogram jest tygodniowy, osobny dla każdej strefy: bloki `{dni, godzina, tryb | temperatura}`. Blok trwa do
następnego — także przez kolejne dni i tygodnie. `switch.<strefa>_schedule` włącza go i wyłącza (wyłączony: tylko
ręczne zmiany).

Co strefa trzyma w danej chwili, od dołu:

1. **Harmonogram** (gdy włączony i niepusty), inaczej cel ustawiony ręcznie.
2. **Nadpisania** — od–do, tryb albo temperatura, z powodem i źródłem. Wygrywają z harmonogramem i znikają same.
3. **Ręczne zmiany** — z karty, pokrętła, pilota, głosem albo z innego systemu. Przy włączonym harmonogramie
   obowiązują **do następnej zmiany** (następny blok albo początek lub koniec nadpisania). **Trzymaj do** i
   **Trzymaj na stałe** (usługa `heat_zones.hold`) przedłużają je, a `heat_zones.resume` wraca do harmonogramu.

Między nadpisaniami a ręcznymi zmianami **wygrywa nowsza instrukcja**: ręczna zmiana wygrywa z trwającym
nadpisaniem; nadpisanie, które zaczyna się później, wygrywa z wcześniejszym trzymaniem, a po jego końcu trzymanie
wraca.

**Nagrzewanie na zapas (optimum start).** Przed cieplejszym blokiem strefa zaczyna grzać na tyle wcześnie, żeby
zdążyć na czas — z modelu cieplnego, zmierzonej temperatury i prognozy temperatury na dworze, najwyżej *Zaczynaj
nagrzewać najwyżej* godzin wcześniej (domyślnie 3). Zanim model się nauczy, liczą się wartości domyślne; dokładny
jest po kilku dniach grzania (albo od razu z *Początkiem sezonu grzewczego*).

`sensor.<strefa>_next_change` mówi, kiedy cel zmieni się następnym razem, na jaki i dlaczego (`schedule`,
`override`, `hold`, `preheat`).

## Encje strefy

| Encja | Co |
|---|---|
| `climate.<strefa>` | cel w miejscu pomiaru, `heat`/`off`, tryby `comfort`, `eco`, `sleep`, `away` i własne; atrybuty niżej |
| `switch.<strefa>_schedule` | harmonogram wł./wył. |
| `sensor.<strefa>_next_change` | następna zmiana (czas; `temperature`, `preset_mode`, `source`, `reason`) |
| `select.<strefa>_measure_at` | gdzie ma być ciepło (strefy z więcej niż jednym czujnikiem) |
| `binary_sensor.<strefa>_problem` | coś wymaga uwagi (`device_class: problem`) |
| `binary_sensor.<strefa>_window_pause` | grzanie wstrzymane przez otwarte okno |
| `number.<strefa>_valve_limit` | limit otwarcia zaworu (głowice z takim ustawieniem) |
| `sensor.<strefa>_heating_rate`, `_cooling_rate`, `_heating_power`, `_model_confidence`, `_room_samples` | nauka i model cieplny (diagnostyczne) |

Tryb we wszystkich strefach naraz: `climate.set_preset_mode` z wszystkimi termostatami stref jako celem.

Atrybuty termostatu: `measure_at`, `rooms` (temperatura, czujnik, granica, wyuczona różnica i przewidywana
temperatura każdego pokoju), `thermostats` (encja i tryb sterowania), `room_temperature_sent`, `limited_by`,
`max_reachable`, `reach_at` (kiedy cel), `window_pause`, `open_windows`, `problem`, `source`, `reason`,
`override_id`, `hold`, `schedule_enabled`, `preset_temperatures`, `next_change` i atrybuty kontraktu.

## Karta

Integracja serwuje i rejestruje kartę; dodaj ją w edytorze pulpitu (*Heat Zones*) albo w YAML:

```yaml
type: custom:heat-zones-card
entity: climate.living_area
# opcjonalnie
show_controls: true
show_schedule: true
show_overrides: true
```

Karta pokazuje strefę teraz (temperatura, cel, dlaczego, co dalej, pauza przy oknie i problemy), tryby i trzymanie, edytor harmonogramu
(dotknij dnia, zmień jego bloki, skopiuj na inne dni) i nadpisania. Edytor i lista nadpisań to też osobne
elementy, `<heat-zones-schedule-editor>` i `<heat-zones-overrides>` (właściwości `hass` i `entity`), do użycia
w innych kartach. Oba idą za motywem Home Assistanta i dają się przestylować (zob.
[Wygląd i motyw](#wygląd-i-motyw-theming)).

## Wygląd i motyw (Theming)

Karta i oba elementy edytora nie mają własnych kolorów, czcionek, rozmiarów, promieni, cieni ani odstępów: wszystko
bierze z motywu Home Assistanta. Bez ustawień karta idzie za aktywnym motywem, jasnym albo ciemnym. Motyw (albo
karta, która osadza `<heat-zones-schedule-editor>` / `<heat-zones-overrides>`) może ją przestylować zmiennymi
poniżej, bez ruszania reszty Home Assistanta. Ustawia się je w motywie (bez początkowego `--`), na elemencie
nadrzędnym albo na samym elemencie karty. Ramka karty (`ha-card`: tło, obramowanie, promień, cień) idzie za zwykłymi
zmiennymi `--ha-card-*`, jak w każdej karcie.

Domyślny wygląd idzie za Liquid Glass Apple, przeniesionym na web. Treść (temperatury, tydzień, lista nadpisań)
zostaje zwykła; szkło jest tylko dla kontrolek, które unoszą się nad nią. Kontrolki, które należą do siebie, mają
jeden wspólny szklany pojemnik (tryby, trzymanie, − / +), a przyciski w środku same nie są ze szkła. Wybrana opcja
jest zabarwiona, akcja główna (Zapisz, Trzymaj) wypełniona kolorem akcentu, rogi są koncentryczne (pojemnik =
kontrolka + odstęp), a edycja dnia i dodawanie nadpisania otwierają się w uniesionym szklanym arkuszu. Wciśnięcie
kontrolki daje krótkie zmniejszenie. Przy systemowym *ograniczeniu przezroczystości* albo *większym kontraście*
szkło staje się pełne (większy kontrast rysuje też mocniejsze krawędzie), a przy *ograniczeniu ruchu* nie ma
animacji wciśnięcia.

```yaml
# themes.yaml
moj_motyw:
  heat-zones-accent-color: "#e0a040"
  heat-zones-heating-color: "#ff7a1a"
  heat-zones-button-border-radius: 6px
  heat-zones-schedule-strength: 100%
```

**Pismo**

| Zmienna | Domyślnie | Do czego |
| --- | --- | --- |
| `--heat-zones-font-family` | `--ha-font-family-body` | Cały tekst (następczyni `--primary-font-family` w HA) |
| `--heat-zones-font-size` | `--ha-font-size-m` | Zwykły tekst |
| `--heat-zones-small-font-size` | `--ha-font-size-s` | Linie drugorzędne, nazwy dni, problemy |
| `--heat-zones-tiny-font-size` | `--ha-font-size-xs` | Napisy na paskach dni, godziny |
| `--heat-zones-title-font-size` | `--ha-font-size-l` | Nazwa strefy, tytuły sekcji |
| `--heat-zones-title-font-weight` | `--ha-font-weight-medium` | Tytuły, wybrane przyciski i dni, cel |
| `--heat-zones-temperature-font-size` | `--ha-font-size-4xl` | Bieżąca temperatura |
| `--heat-zones-temperature-font-weight` | `--ha-font-weight-light` | Bieżąca temperatura |
| `--heat-zones-target-font-size` | `--ha-font-size-xl` | Cel między − i + |
| `--heat-zones-line-height` | `--ha-line-height-normal` | Cały tekst |
| `--heat-zones-condensed-line-height` | `--ha-line-height-condensed` | Bieżąca temperatura |

**Odstępy i kształt**

| Zmienna | Domyślnie | Do czego |
| --- | --- | --- |
| `--heat-zones-card-padding` | `--ha-space-4` | Wnętrze karty |
| `--heat-zones-gap` | `--ha-space-2` | Między przyciskami, wierszami i pozycjami listy |
| `--heat-zones-small-gap` | `--ha-space-1` | Między paskami dni, pod temperaturą |
| `--heat-zones-section-gap` | `--ha-space-4` | Nad i pod liniami między sekcjami |
| `--heat-zones-control-height` | `--ha-space-10` | Najmniejsza wysokość przycisków i pól (pole dotyku) |
| `--heat-zones-control-padding` | `--ha-space-2` `--ha-space-4` | Wnętrze przycisków |
| `--heat-zones-input-padding` | `--ha-space-1` `--ha-space-2` | Wnętrze pól |
| `--heat-zones-group-padding` | `--ha-space-1` | Wnętrze szklanej grupy, wokół przycisków |
| `--heat-zones-sheet-padding` | `--ha-space-3` | Wnętrze arkusza |
| `--heat-zones-bar-height` | `--ha-space-6` | Paski dni harmonogramu |
| `--heat-zones-border-width` | `--ha-border-width-sm` | Krawędzie szkła, pól i linie |
| `--heat-zones-focus-width` | `--ha-border-width-md` | Obwódka edytowanego dnia |
| `--heat-zones-button-border-radius` | `--ha-border-radius-pill` | Przyciski (kapsuły) |
| `--heat-zones-icon-button-border-radius` | `--ha-border-radius-pill` | −, +, ✕ i przyciski dni |
| `--heat-zones-input-border-radius` | `--ha-border-radius-pill` | Pola |
| `--heat-zones-group-border-radius` | pół wysokości kontrolki + odstęp grupy | Szklane grupy (koncentrycznie z przyciskami) |
| `--heat-zones-sheet-border-radius` | pół wysokości kontrolki + odstęp arkusza | Arkusze (koncentrycznie z polami) |
| `--heat-zones-bar-border-radius` | `--ha-border-radius-md` | Paski dni |

**Kolory**

| Zmienna | Domyślnie | Do czego |
| --- | --- | --- |
| `--heat-zones-text-color` | `--primary-text-color` | Tekst |
| `--heat-zones-secondary-text-color` | `--secondary-text-color` | Linie drugorzędne, nazwy dni, godziny |
| `--heat-zones-disabled-text-color` | `--disabled-text-color` | Wyłączone przyciski |
| `--heat-zones-accent-color` | `--primary-color` | Wybrane przyciski, edytowany dzień, Zapisz |
| `--heat-zones-on-accent-color` | `--text-primary-color` | Tekst na kolorze akcentu |
| `--heat-zones-selected-color` | 18 % koloru akcentu | Zabarwienie wybranej opcji |
| `--heat-zones-hover-color` | `--secondary-background-color` | Przycisk pod kursorem |
| `--heat-zones-divider-color` | `--divider-color` | Pola i linie |
| `--heat-zones-input-background-color` | `--input-fill-color` | Pola |
| `--heat-zones-track-color` | `--secondary-background-color` | Pasek dnia bez bloków |
| `--heat-zones-heating-color` | `--state-climate-heat-color` | Bieżąca temperatura, gdy strefa grzeje |
| `--heat-zones-window-color` | `--state-binary_sensor-window-on-color`, inaczej `--info-color` | Linia powodu w czasie pauzy przy oknie |
| `--heat-zones-problem-color` | `--state-binary_sensor-problem-on-color`, inaczej `--error-color` | Problemy strefy (z `homeai_signals`) |

**Szkło**

| Zmienna | Domyślnie | Do czego |
| --- | --- | --- |
| `--heat-zones-glass-color` | `--card-background-color` | Kolor materiału szkła |
| `--heat-zones-glass-opacity` | `70%` | Ile z niego zakrywa to, co pod spodem (100% = pełne) |
| `--heat-zones-glass-blur` | `--ha-space-4` | Rozmycie tego, co pod spodem |
| `--heat-zones-glass-border-color` | `--divider-color` | Krawędź szkła |
| `--heat-zones-glass-highlight-color` | krawędź zmieszana z `--ha-color-white` | Oświetlona górna krawędź |
| `--heat-zones-glass-shadow` | `--ha-box-shadow-s` | Głębia grup, przycisków i akcji głównej |
| `--heat-zones-sheet-shadow` | `--ha-box-shadow-m` | Głębia arkuszy |
| `--heat-zones-transition-duration` | `--ha-animation-duration-fast` | Reakcja na wciśnięcie i najechanie |
| `--heat-zones-press-scale` | `0.97` | Rozmiar wciśniętej kontrolki |

**Paski harmonogramu.** Kolor bloku to jego cel na skali chłodno–ciepło: poniżej 19,75 °C kolor zimny, od 19,75 °C
ciepły, wmieszany w kolor bazowy — przy środku jedna trzecia `--heat-zones-schedule-strength`, w całości przy 16 °C
i niżej albo 23 °C i wyżej (`color-mix(in srgb, odcień udział × siła, baza)`).

| Zmienna | Domyślnie | Do czego |
| --- | --- | --- |
| `--heat-zones-cold-color` | `--state-climate-cool-color` | Chłodniejsze cele |
| `--heat-zones-warm-color` | `--state-climate-heat-color` | Cieplejsze cele |
| `--heat-zones-unknown-color` | `--disabled-color` | Tryb bez temperatury |
| `--heat-zones-schedule-base-color` | `--card-background-color` | W co mieszane są kolory; linie między blokami |
| `--heat-zones-schedule-text-color` | `--primary-text-color` | Napisy na paskach |
| `--heat-zones-schedule-strength` | `70%` | Jak mocne są kolory na końcach skali |

**Części (`::part`).** Gdzie zmienna nie wystarcza, elementy stylujesz przez `::part()`. Część może mieć też nazwę
stanu, np. `::part(segment warm)` albo `::part(button active)`. Karta przekazuje dalej części edytorów, więc
`heat-zones-card::part(segment)` też działa.

```css
heat-zones-card::part(title) { text-transform: uppercase; }
heat-zones-schedule-editor::part(day-bar) { border-radius: 0; }
```

| Element | Części (nazwy stanów) |
| --- | --- |
| `heat-zones-card` | `card`, `header`, `title`, `temperature` (`heating`), `reason` (`window`), `problem`, `next`, `target` (`group`, `glass`), `target-value`, `controls` (`group`, `glass`), `button` (`active`, `primary`, `icon`, `glass`), `input`, `section`, `section-title`, `message` |
| `heat-zones-schedule-editor` | `week`, `day-label` (`selected`), `day-bar` (`selected`), `segment` (`cold`, `warm`, `unknown`), `hours`, `blocks` (`sheet`, `glass`), `sheet-title`, `block`, `input`, `button` (`active`, `primary`, `icon`), `message` |
| `heat-zones-overrides` | `list`, `override`, `form` (`sheet`, `glass`), `input`, `button` (`primary`, `icon`, `glass`), `message` |

`::part(glass)` sięga naraz do każdej szklanej powierzchni, np. żeby dać im inny materiał.

## Kontrakt dla innych systemów

Heat Zones publikuje, co zrobi, i przyjmuje zmiany od systemów takich jak HomeAI. Ten sam kontrakt może spełnić
każda integracja termostatu. Szczegóły (pola, odpowiedzi, przykład) są w [README po angielsku](README.md#contract-for-other-systems):

- atrybuty `homeai_schedule` (`{"version": 1, "domain": "heat_zones", "areas": [...], "features": ["open_end"]}` —
  `areas` to obszary, które strefa grzeje, `features` to opcjonalne części kontraktu, które termostat rozumie),
  `homeai_plan` (`{start, title, end?}`,
  36 h, do 50) i `homeai_signals` (`{id, title, severity 0–4, category, description?, need?, group?}`);
- usługi `heat_zones.add_override` (odpowiedź `{override_id}`), `remove_override`, `get_schedule` (odpowiedź
  `{entity_id: {enabled, weekly, overrides}}`), `set_schedule`, `estimate` (odpowiedź
  `{entity_id: {minutes | null, confidence}}`) i `reset_learning`.

Nadpisanie z `open_end: true` ma koniec tylko jako horyzont: nadawca przedłuża je, dopóki trwa powód (nikogo
w domu, tryb urlopowy), i usuwa, gdy powód minie. Strefa nie nagrzewa na zapas pod taki koniec (pod prawdziwy, np.
powrót z wyjazdu — tak), a przedłużenie zachowuje wiek i początek nadpisania.

Nadpisanie wysłane ponownie bez zmian (ten sam początek, koniec i wartość) zachowuje swój wiek, więc nie cofa
ręcznej zmiany zrobionej w międzyczasie. Stany zapisane przez usługę Stref niosą kontekst wywołującego, a własne
zmiany integracji (harmonogram, nagrzewanie, koniec nadpisania) — świeży kontekst bez użytkownika.

Poza kontraktem: `heat_zones.hold` (`temperature` albo `preset_mode`, `until` albo `permanent`) i
`heat_zones.resume`.

## Uwagi

- Strefy budowane z obszarów reagują na zmiany rejestrów: nowa głowica albo czujnik w pokoju strefy przebudowuje
  strefy po chwili.
- Nauka startuje od zera po instalacji; `heat_zones.reset_learning` ją kasuje.
- Diagnostyka (*⋮ → Pobierz diagnostykę*) zawiera konfigurację, stan i naukę stref.

## Rozwój

Zobacz [CONTRIBUTING.md](CONTRIBUTING.md). Heat Zones wyrosło z prywatnej integracji *Strefy ciepła* (wersja
1.10), bez jej trybu Auto: planowanie z obecności i nawyków należy do systemów takich jak HomeAI, które korzystają
z kontraktu.

## Licencja

[Apache 2.0](LICENSE)
