from flask import jsonify, request, Response
from . import webcam, serial_handler

def register_routes(app):
    # Webcam route
    @app.route('/')
    def index():
        return "<h1>Webcam Live Feed</h1><img src='/video'>"

    @app.route('/video')
    def video():
        return Response(webcam.generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

    # Serial API routes
    @app.route('/api/available-ports', methods=['GET'])
    def available_ports():
        ports = serial_handler.scan_ports()
        return jsonify({"ports": ports})

    @app.route('/api/start-listener', methods=['POST'])
    def start_listener():
        data = request.get_json()
        left = data.get("left")
        if not left:
            return jsonify({"status": "missing ports"}), 400

        serial_handler.selected_ports["left"] = left
        success = serial_handler.start_listeners(left)
        if success:
            return jsonify({"status": "ok"})
        else:
            return jsonify({"status": "error opening port"}), 500
