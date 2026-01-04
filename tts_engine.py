from gtts import gTTS
import os
import uuid
import playsound

def speak(text, lang="en"):
    try:
        filename = f"temp_{uuid.uuid4()}.mp3"
        tts = gTTS(text=text, lang=lang)
        tts.save(filename)

        playsound.playsound(filename)

        os.remove(filename)  # delete immediately

    except Exception as e:
        print("TTS Error:", e)

