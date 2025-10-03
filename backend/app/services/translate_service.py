from googletrans import Translator

translator = Translator()

async def translate_text(text: str, target_lang: str = "en"):
    """
    Translate text into the target language.
    Default = English ("en")
    """
    try:
        result = await translator.translate(text, dest=target_lang)
        return {"translated_text": result.text, "src": result.src, "dest": result.dest}
    except Exception as e:
        return {"error": str(e)}
