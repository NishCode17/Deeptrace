import torch
from torch.utils.model_zoo import load_url
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import matplotlib.pyplot as plt
from scipy.special import expit

import sys
import os
import uuid

# Add the icpr2020dfdc submodule to the path so we can import its modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'icpr2020dfdc'))

from blazeface import FaceExtractor, BlazeFace, VideoReader
from architectures import fornet,weights
from isplutils import utils

"""
Choose an architecture between
- EfficientNetB4
- EfficientNetB4ST
- EfficientNetAutoAttB4
- EfficientNetAutoAttB4ST
- Xception
"""
net_model = 'EfficientNetAutoAttB4'

"""
Choose a training dataset between
- DFDC
- FFPP
"""
train_db = 'DFDC'

app = Flask(__name__)
# CORS is still good to have, though minimal need if only strict backend-to-backend
CORS(app)

device = torch.device('cpu')
face_policy = 'scale'
face_size = 224
frames_per_video = 100

model_url = weights.weight_url['{:s}_{:s}'.format(net_model,train_db)]
net = getattr(fornet,net_model)().eval().to(device)
net.load_state_dict(load_url(model_url,map_location=device,check_hash=True))

transf = utils.get_transformer(face_policy, face_size, net.get_normalizer(), train=False)

facedet = BlazeFace().to(device)
# Update paths to point to the submodule location
facedet.load_weights(os.path.join(os.path.dirname(__file__), "icpr2020dfdc/blazeface/blazeface.pth"))
facedet.load_anchors(os.path.join(os.path.dirname(__file__), "icpr2020dfdc/blazeface/anchors.npy"))

@app.route('/predict', methods=['POST'])
def predict():
    video_path = None
    try:
        if 'video' not in request.files:
            return jsonify({"error": "No video uploaded"}), 400
        
        # Optional: Allow override of frames per video, but default to global
        current_frames_per_video = frames_per_video
        if 'frames_per_video' in request.form:
             current_frames_per_video = int(request.form['frames_per_video'])

        video = request.files['video']
        
        # 1. Generate unique temp filename (Concurrency fix)
        unique_id = str(uuid.uuid4())
        video_path = f"temp_{unique_id}.mp4"
        video.save(video_path)

        # 2. Process the video
        videoreader = VideoReader(verbose=False)
        video_read_fn = lambda x: videoreader.read_frames(x, num_frames=current_frames_per_video)
        face_extractor = FaceExtractor(video_read_fn=video_read_fn, facedet=facedet)
        vid_face_extractor = face_extractor.process_video(video_path)

        im_face = torch.stack([transf(image=frame['faces'][0])['image']
                               for frame in vid_face_extractor if len(frame['faces'])])

        with torch.no_grad():
            faces_pred = net(im_face.to(device)).cpu().numpy().flatten()

        mean_score = expit(faces_pred.mean())
        faces_pred = expit(faces_pred)

        return jsonify({
            "pred_scores": faces_pred.tolist(),
            "mean_score": float(mean_score)
        }), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500
    
    finally:
        # 3. Cleanup logic (Mandatory)
        if video_path and os.path.exists(video_path):
            try:
                os.remove(video_path)
            except OSError as cleanup_err:
                 print(f"Error deleting temp file {video_path}: {cleanup_err}")

@app.after_request
def add_headers(response):
    response.headers['Content-Type'] = 'application/json'
    return response

if __name__ == '__main__':
    # Running on port 8080 as expected
    app.run(debug=True, port = 8080)