import os
import sys
import shutil
import numpy as np
from datetime import datetime
from tensorflow.keras.models import load_model
from PIL import Image
import tensorflow as tf

# Rutas de Docker
MODEL_PATH = '/app/model/leaf_patch_model.h5'
IMAGE_SIZE = (224, 224)

# Rutas base para el entorno Docker
LEAF_CLASSIFICATION_DIR = "/app/backend/data/leaf_classification"
LAST_IMAGE_DIR = os.path.join(LEAF_CLASSIFICATION_DIR, "last_image")
LAST_PREDICTION_FILE = os.path.join(LEAF_CLASSIFICATION_DIR, "last_prediction.txt")
LOGS_DIR = os.path.join(LEAF_CLASSIFICATION_DIR, "logs")
PREDICTED_IMAGES_DIR = os.path.join(LEAF_CLASSIFICATION_DIR, "predicted_images")

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)

def get_latest_image_from_last_image_dir():
    if not os.path.exists(LAST_IMAGE_DIR):
        print(f"El directorio {LAST_IMAGE_DIR} no existe.", file=sys.stderr)
        return None, None
    
    files = [f for f in os.listdir(LAST_IMAGE_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    if not files:
        return None, None
    
    image_filename = files[0]
    return os.path.join(LAST_IMAGE_DIR, image_filename), image_filename


def center_crop_and_resize(img_path):
    try:
        img = Image.open(img_path).convert('RGB')
        width, height = img.size
        min_dim = min(width, height)
        left = (width - min_dim) / 2
        top = (height - min_dim) / 2
        right = (width + min_dim) / 2
        bottom = (height + min_dim) / 2
        img_cropped = img.crop((left, top, right, bottom))
        img_resized = img_cropped.resize(IMAGE_SIZE)
        img_array = tf.keras.utils.img_to_array(img_resized)
        img_array = tf.expand_dims(img_array, 0)
        img_array = img_array / 255.0
        return img_array
    except Exception as e:
        print(f"Error en center_crop_and_resize para {img_path}: {e}", file=sys.stderr)
        raise

def main():
    ensure_dir(LOGS_DIR)
    ensure_dir(PREDICTED_IMAGES_DIR)

    image_to_predict_path, base_image_filename = get_latest_image_from_last_image_dir()

    if not image_to_predict_path:
        print("No hay imagen en 'last_image' para procesar.")
        sys.exit(0)

    filename_without_ext = os.path.splitext(base_image_filename)[0]
    log_file_path = os.path.join(LOGS_DIR, f"{filename_without_ext}.txt")
    predicted_image_dest_path = os.path.join(PREDICTED_IMAGES_DIR, base_image_filename)
    
    current_time_for_log = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        model_full_path = MODEL_PATH
        if not os.path.exists(model_full_path):
            error_msg = f"Error: El modelo no existe en {model_full_path}"
            with open(LAST_PREDICTION_FILE, "w") as f: f.write(error_msg)
            with open(log_file_path, "w") as f: f.write(f"{current_time_for_log} {error_msg}\n")
            print(error_msg, file=sys.stderr)
            sys.exit(3)

        model = load_model(model_full_path, compile=False)
        img_array = center_crop_and_resize(image_to_predict_path)
        
        pred = model.predict(img_array)
        pred_value = float(pred[0][0]) if isinstance(pred, (np.ndarray, list)) and pred.ndim > 1 else float(pred[0])

        shutil.copy(image_to_predict_path, predicted_image_dest_path)

        if pred_value < 0.5:
            result = f"Parece que tu cultivo no está saludable, con una predicción de aproximadamente {pred_value:.2f}"
            exit_code = 2
        else:
            result = f"Parece que tu cultivo está saludable, con una predicción de aproximadamente {pred_value:.2f}"
            exit_code = 1
        
        with open(LAST_PREDICTION_FILE, "w") as f:
            f.write(result)
        
        with open(log_file_path, "w") as f:
            f.write(f"{current_time_for_log} {result} (Image: {base_image_filename})\n")
        
        print(f"Prediction: {result} for {base_image_filename}")
        sys.exit(exit_code)

    except Exception as e:
        error_msg = f"error: {str(e)}"
        with open(LAST_PREDICTION_FILE, "w") as f:
            f.write(error_msg)
        with open(log_file_path, "w") as f:
            f.write(f"{current_time_for_log} {error_msg} (Imagen: {base_image_filename})\n")
        print(f"Error durante la predicción para {base_image_filename}: {e}", file=sys.stderr)
        sys.exit(3)

if __name__ == '__main__':
    main()
