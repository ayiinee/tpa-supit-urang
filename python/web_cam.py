from flask import Flask, Response
import cv2

app = Flask(__name__)
camera = cv2.VideoCapture(0)  # 0 = default webcam

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            # encode frame sebagai JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            # hasilkan frame dalam format MJPEG
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video')
def video():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return "<h1>Webcam Live Feed</h1><img src='/video'>"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
