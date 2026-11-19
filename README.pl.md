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

Karta pokazuje strefę teraz (temperatura, cel, dlaczego, co dalej), tryby i trzymanie, edytor harmonogramu
(dotknij dnia, zmień jego bloki, skopiuj na inne dni) i nadpisania. Edytor i lista nadpisań to też osobne
elementy, `<heat-zones-schedule-editor>` i `<heat-zones-overrides>` (właściwości `hass` i `entity`), do użycia
w innych kartach.

## Kontrakt dla innych systemów

Heat Zones publikuje, co zrobi, i przyjmuje zmiany od systemów takich jak HomeAI. Ten sam kontrakt może spełnić
każda integracja termostatu. Szczegóły (pola, odpowiedzi, przykład) są w [README po angielsku](README.md#contract-for-other-systems):

- atrybuty `homeai_schedule` (`{"version": 1, "domain": "heat_zones"}`), `homeai_plan` (`{start, title, end?}`,
  36 h, do 50) i `homeai_signals` (`{id, title, severity 0–4, category, description?, need?, group?}`);
- usługi `heat_zones.add_override` (odpowiedź `{override_id}`), `remove_override`, `get_schedule` (odpowiedź
  `{entity_id: {enabled, weekly, overrides}}`), `set_schedule`, `estimate` (odpowiedź
  `{entity_id: {minutes | null, confidence}}`) i `reset_learning`.

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
