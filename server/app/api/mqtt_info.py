from flask import jsonify
from . import api_bp

@api_bp.route('/mqtt/info', methods=['GET'])
def mqtt_info():
    """
    get mqtt integration information and documentation
    ---
    tags:
      - MQTT Integration
    responses:
      200:
        description: mqtt configuration and usage information
        schema:
          type: object
          properties:
            mqtt_broker:
              type: string
              example: "broker.emqx.io"
            mqtt_port:
              type: integer
              example: 1883
            subscribe_topic:
              type: string
              example: "esp32/+/attendance"
              description: "server subscribes to this topic to receive attendance data from esp32 devices"
            publish_topic_pattern:
              type: string
              example: "esp32/<device_id>/response"
              description: "server publishes responses to this topic pattern"
            message_flow:
              type: object
              properties:
                step_1:
                  type: string
                  example: "esp32 publishes to: esp32/<device_id>/attendance"
                step_2:
                  type: string
                  example: "server validates user and saves attendance log"
                step_3:
                  type: string
                  example: "server publishes response to: esp32/<device_id>/response"
            incoming_payload_format:
              type: object
              properties:
                rfid_uid:
                  type: string
                  example: "ABC123456"
                timestamp:
                  type: string
                  example: "2025-12-24T10:30:00Z"
                code:
                  type: string
                  example: "REALTIME"
                  description: "REALTIME or OFFLINE_SYNC"
            response_payload_format:
              type: object
              properties:
                is_success:
                  type: boolean
                  example: true
                user_id:
                  type: integer
                  example: 1
                user_name:
                  type: string
                  example: "Nguyen Van A"
                rfid_uid:
                  type: string
                  example: "ABC123456"
                error_code:
                  type: string
                  example: null
                  description: "null, USER_NOT_FOUND, or USER_NOT_ACTIVE"
                time_stamp:
                  type: string
                  example: "10:30"
            error_codes:
              type: object
              properties:
                USER_NOT_FOUND:
                  type: string
                  example: "rfid_uid does not exist in database"
                USER_NOT_ACTIVE:
                  type: string
                  example: "user exists but is_active = false"
    """
    return jsonify({
        "mqtt_broker": "broker.emqx.io",
        "mqtt_port": 1883,
        "subscribe_topic": "esp32/+/attendance",
        "publish_topic_pattern": "esp32/<device_id>/response",
        "message_flow": {
            "step_1": "esp32 publishes attendance data to: esp32/<device_id>/attendance",
            "step_2": "server validates user exists and is active, then saves attendance log to database",
            "step_3": "server publishes response back to: esp32/<device_id>/response"
        },
        "incoming_payload_format": {
            "rfid_uid": "ABC123456",
            "timestamp": "2025-12-24T10:30:00Z",
            "code": "REALTIME or OFFLINE_SYNC"
        },
        "response_payload_format": {
            "is_success": True,
            "user_id": 1,
            "user_name": "Nguyen Van A",
            "rfid_uid": "ABC123456",
            "error_code": "null, USER_NOT_FOUND, or USER_NOT_ACTIVE",
            "time_stamp": "10:30"
        },
        "error_codes": {
            "USER_NOT_FOUND": "rfid_uid does not exist in database",
            "USER_NOT_ACTIVE": "user exists but is_active = false"
        },
        "notes": [
            "mqtt handlers run automatically in the background",
            "no manual api calls needed for mqtt communication",
            "esp32 devices communicate directly via mqtt broker",
            "attendance logs are saved automatically when messages are received"
        ]
    })
