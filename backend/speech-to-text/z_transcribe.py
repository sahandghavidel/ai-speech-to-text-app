import base64
import io
import os

import modal
from pydantic import BaseModel

app = modal.App("z-speech-to-text")

MODEL_ID = "CohereLabs/cohere-transcribe-03-2026"
HF_SECRET = modal.Secret.from_name(os.getenv("MODAL_HF_SECRET_NAME", "hf-secret"))
SECRETS = [HF_SECRET]
VOL = modal.Volume.from_name(
    os.getenv("MODAL_HF_CACHE_VOLUME_NAME", "hf-hub-cache"), create_if_missing=True
)

image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("ffmpeg", "git")
    .pip_install_from_requirements("requirements.txt")
    .env({"HF_HUB_CACHE": "/models", "HF_HOME": "/models"})
)


class Req(BaseModel):
    audio_base64: str
    language: str = "en"


@app.cls(
    image=image,
    gpu=os.getenv("MODAL_GPU", "L40S"),
    timeout=900,
    scaledown_window=600,
    volumes={"/models": VOL},
    secrets=SECRETS,
)
class ZTranscribeServer:
    @modal.enter()
    def load(self):
        import torch
        from transformers import AutoProcessor, CohereAsrForConditionalGeneration

        token = (
            (os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_HUB_TOKEN") or "")
            .strip()
            .strip("\"'")
            or None
        )

        self.processor = AutoProcessor.from_pretrained(MODEL_ID, token=token)
        self.model = CohereAsrForConditionalGeneration.from_pretrained(
            MODEL_ID,
            token=token,
            torch_dtype=torch.float16,
            low_cpu_mem_usage=False,
        ).to("cuda")

    @modal.fastapi_endpoint(method="POST", docs=True)
    def transcribe_audio(self, r: Req):
        import librosa

        raw_bytes = base64.b64decode(r.audio_base64)
        audio, _ = librosa.load(io.BytesIO(raw_bytes), sr=16000, mono=True)

        inputs = self.processor(
            audio=audio,
            sampling_rate=16000,
            return_tensors="pt",
            language=r.language,
        )
        audio_chunk_index = inputs.pop("audio_chunk_index", None)
        inputs = inputs.to(self.model.device, dtype=self.model.dtype)

        outputs = self.model.generate(**inputs, max_new_tokens=512)

        if audio_chunk_index is not None:
            text = self.processor.decode(
                outputs,
                skip_special_tokens=True,
                audio_chunk_index=audio_chunk_index,
                language=r.language,
            )
        else:
            decoded = self.processor.batch_decode(outputs, skip_special_tokens=True)
            text = decoded[0] if decoded else ""

        return {
            "text": text,
            "model_id": MODEL_ID,
            "language": r.language,
        }