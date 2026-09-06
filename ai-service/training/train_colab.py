"""
ForeSite - Colab Fine-Tuning Script
This script fine-tunes all-MiniLM-L6-v2 on safety incident pairs using MultipleNegativesRankingLoss.
Run this in Google Colab with a free T4 GPU (~5-10 minutes).

Instructions:
1. Open Google Colab (colab.research.google.com)
2. Change runtime to GPU (Runtime -> Change runtime type -> T4 GPU)
3. Upload this script and `training_pairs.json` (or paste into a cell)
4. Run:
   !pip install sentence-transformers datasets
   python train_colab.py
5. Download the exported `custom-sif-minilm.zip` and extract into `ai-service/models/custom-sif-minilm`
"""

import json
import os
import shutil
from pathlib import Path

def train_model():
    from sentence_transformers import SentenceTransformer, InputExample, losses
    from torch.utils.data import DataLoader

    data_path = Path("training_pairs.json")
    if not data_path.exists():
        data_path = Path(__file__).resolve().parent / "training_pairs.json"

    with open(data_path, "r", encoding="utf-8") as f:
        pairs = json.load(f)

    print(f"Loaded {len(pairs)} safety training pairs.")

    # Convert to InputExample (Anchor: Report, Positive: Precursor)
    train_examples = []
    for item in pairs:
        train_examples.append(InputExample(
            texts=[item["report"], item["precursor"]]
        ))

    # Initialize lightweight base model
    model_id = "all-MiniLM-L6-v2"
    print(f"Loading base model: {model_id}")
    model = SentenceTransformer(model_id)

    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=16)
    train_loss = losses.MultipleNegativesRankingLoss(model)

    print("Beginning fine-tuning on safety domain pairs...")
    output_path = "custom-sif-minilm"
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=4,
        warmup_steps=10,
        show_progress_bar=True,
        output_path=output_path
    )

    print(f"Model saved successfully to '{output_path}'.")

    # Zip for easy Colab download
    zip_name = "custom-sif-minilm"
    shutil.make_archive(zip_name, 'zip', output_path)
    print(f"Archive '{zip_name}.zip' created! Ready to download and place into ai-service/models/")

if __name__ == "__main__":
    train_model()
