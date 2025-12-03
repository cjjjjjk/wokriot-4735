from flask import jsonify

def success_response(data=None, message="Thao tac thanh cong", status_code=200):
    return jsonify({
        "is_success": True,
        "message": message,
        "data": data,
        "error_code": None
    }), status_code

def error_response(message="Thao tac that bai", error_code=None, status_code=400):
    return jsonify({
        "is_success": False,
        "message": message,
        "data": None,
        "error_code": error_code
    }), status_code