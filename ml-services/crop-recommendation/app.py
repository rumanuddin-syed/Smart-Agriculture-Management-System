from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)
model = joblib.load('crop_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    features = np.array([[
        data['N'], data['P'], data['K'],
        data['temperature'], data['humidity'],
        data['ph'], data['rainfall']
    ]])
    prediction = model.predict(features)
    probabilities = model.predict_proba(features)
    confidence = float(np.max(probabilities))

    return jsonify({
        'crop': prediction[0],
        'confidence': round(confidence, 4)
    })

if __name__ == '__main__':
    app.run(port=5001)
