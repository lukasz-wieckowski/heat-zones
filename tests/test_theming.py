"""The card and the editors take their looks from the Home Assistant theme.

No colour, font, size, radius, shadow or spacing of their own outside the token block in `styles.ts`, where every
public `--heat-zones-*` variable falls back to a Home Assistant variable. Every public variable and `::part` name is
documented in both READMEs.
"""

from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).parents[1]
SRC = ROOT / "frontend" / "src"
READMES = [ROOT / "README.md", ROOT / "README.pl.md"]

# Defaults that are not Home Assistant variables, on purpose.
LITERAL_DEFAULTS = {
    "--heat-zones-schedule-strength": "70%",
    "--heat-zones-glass-opacity": "70%",
    "--heat-zones-press-scale": "0.97",
    "--heat-zones-sheet-opacity": "92%",
}
# Values with numbers allowed outside the token block: layout, not looks.
ALLOWED_NUMBERS = {
    "flex": {"1", "1 1 20ch", "1 1 auto"},
    "grid-column": {"2"},
    "min-width": {"6ch"},
    "width": {"8ch", "100%", "min(100%, 72ch)"},
    "max-width": {"60%"},
    "max-height": {"92dvh"},
    "height": {"100%"},
}
ALLOWED_COLUMNS = {"max-content 1fr", "auto 1fr"}
COLOUR = re.compile(
    r"#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|(?<![\w-])(?:white|black|red|blue|orange|gray|grey)(?![\w-])"
)
NUMBER = re.compile(r"(?<![\w-])\d*\.?\d+(?:[a-z]+|%)?")


def sources() -> dict[str, str]:
    return {p.name: p.read_text() for p in sorted(SRC.glob("*.ts"))}


def css_blocks(text: str) -> list[str]:
    return re.findall(r"css`(.*?)`", text, re.S)


def split_tokens(text: str) -> tuple[str, str]:
    start, end = text.index("/* tokens:start */"), text.index("/* tokens:end */")
    return text[start:end], text[:start] + text[end:]


def declarations(block: str) -> list[tuple[str, str]]:
    block = re.sub(r"/\*.*?\*/", "", block, flags=re.S)
    return [(p.strip(), v.strip()) for p, v in re.findall(r"([\w-]+)\s*:\s*([^;{}]+);", block)]


def tokens() -> dict[str, str]:
    block, _ = split_tokens(sources()["styles.ts"])
    return {public: default.strip() for public, default in re.findall(r"var\((--heat-zones-[\w-]+),\s*(.+)\);", block)}


def part_names(text: str) -> set[str]:
    names: set[str] = set()
    for static in re.findall(r'\bpart="([^"]+)"', text):
        names.update(static.split())
    for dynamic in re.findall(r"\bpart=\$\{parts\(([^)]*)\)\}", text):
        names.update(re.findall(r'"([\w-]+)"', dynamic))
        if "side" in dynamic:  # the segment's side of the scale, from `tone()`
            names.update({"cold", "warm", "unknown"})
    return names


def test_token_defaults_are_home_assistant_variables() -> None:
    found = tokens()
    assert len(found) >= 30
    for public, default in found.items():
        if public in LITERAL_DEFAULTS:
            assert default == LITERAL_DEFAULTS[public]
            continue
        assert not COLOUR.search(default), (public, default)
        numbers = NUMBER.findall(re.sub(r"var\(--[\w-]+", "", default))
        if default.startswith("var(--"):
            assert not numbers, (public, default)
        elif default.startswith("color-mix("):  # a share of a theme colour
            assert all(n.endswith("%") for n in numbers), (public, default)
        elif default.startswith("calc("):  # derived from other sizes, e.g. concentric corners
            assert all(re.fullmatch(r"\d*\.?\d+", n) for n in numbers), (public, default)
        else:
            raise AssertionError((public, default))


def test_no_fixed_looks_outside_the_tokens() -> None:
    for name, source in sources().items():
        text = split_tokens(source)[1] if name == "styles.ts" else source
        assert not COLOUR.search(re.sub(r"//.*", "", text)), name
        for block in css_blocks(text):
            for prop, value in declarations(block):
                stripped = re.sub(r"var\(--[\w-]+", "", value)
                stripped = re.sub(r"(?<![\w.])0(?![\w.%])", "", stripped)  # a bare zero is no look of its own
                if not NUMBER.search(stripped):
                    continue
                if prop == "grid-template-columns":
                    assert value in ALLOWED_COLUMNS, (name, prop, value)
                elif prop == "background" and value.startswith("color-mix("):
                    assert NUMBER.findall(stripped) == [], (name, prop, value)
                else:
                    assert value in ALLOWED_NUMBERS.get(prop, set()), (name, prop, value)


def test_inline_styles_only_place_schedule_segments() -> None:
    for name, text in sources().items():
        for style in re.findall(r'\bstyle="([^"]*)"', text):
            props = {d.split(":", 1)[0].strip() for d in style.split(";") if d.strip()}
            assert props <= {"left", "width", "--hz-share"}, (name, style)


def test_documented_variables_and_parts() -> None:
    variables = set(tokens())
    used = set(re.findall(r"--heat-zones-[\w-]+", "".join(sources().values())))
    assert used == variables
    names = part_names("".join(sources().values()))
    assert {"card", "temperature", "heating", "reason", "window", "problem", "segment", "day-bar"} <= names
    for readme in READMES:
        text = readme.read_text()
        start = re.search(r"^## .*Theming.*$", text, re.M)
        assert start, readme.name
        section = text[start.start() :]
        section = section[: section.index("\n## ", 4)]
        documented = set(re.findall(r"`(--heat-zones-[\w-]+)`", section))
        assert documented == variables, (readme.name, documented ^ variables)
        for part in names:
            assert f"`{part}`" in section, (readme.name, part)


def test_card_passes_on_the_editor_parts() -> None:
    card, editor = sources()["card.ts"], sources()["editor.ts"]
    exported = {
        m.group(1): {n.strip() for n in m.group(2).split(",")}
        for m in re.finditer(r'export const (\w+_PARTS) =\s*"([^"]+)"', card)
    }
    schedule_part, overrides_part = editor.split("export class HeatZonesOverrides")
    assert exported["EDITOR_PARTS"] == part_names(schedule_part)
    assert exported["OVERRIDES_PARTS"] == part_names(overrides_part)
