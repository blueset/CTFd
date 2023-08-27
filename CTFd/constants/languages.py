from CTFd.constants import RawEnum


class Languages(str, RawEnum):
    ENGLISH = "en"
    # GERMAN = "de"
    # POLISH = "pl"
    # SPANISH = "es"
    CHINESE = "zh"
    JAPANESE = "ja"


LANGUAGE_NAMES = {
    "en": "English",
    "de": "Deutsch",
    "pl": "Polski",
    "es": "Español",
    "zh": "简体中文",
    "ja": "日本語",
}

SELECT_LANGUAGE_LIST = [("", "")] + [
    (str(lang), LANGUAGE_NAMES.get(str(lang))) for lang in Languages
]
