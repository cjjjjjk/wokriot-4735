"""
MQTT Handlers for IoT Attendance System
========================================

This module handles MQTT communication between ESP32 devices and the server.

MQTT Topics:
-----------
Subscribe: esp32/+/attendance
  - receives attendance data from ESP32 devices
  - '+' is a wildcard matching any device_id
  - example: esp32/device001/attendance

Subscribe: esp32/+/control_response
  - receives control command acknowledgement from ESP32 devices
  - example: esp32/device001/control_response

Publish: esp32/<device_id>/response
  - sends response back to specific ESP32 device
  - example: esp32/device001/response

Publish: esp32/<device_id>/control
  - sends control commands to ESP32 device
  - example: esp32/device001/control

Message Flow (Attendance):
-------------------------
1. ESP32 publishes attendance data to: esp32/<device_id>/attendance
   payload format:
   {
     "rfid_uid": "ABC123456",
     "timestamp": "2025-12-24T10:30:00Z",
     "code": "REALTIME"  // or "OFFLINE_SYNC"
   }

2. Server processes the message:
   - validates user exists and is active
   - saves attendance log to database
   - prepares response

3. Server publishes response to: esp32/<device_id>/response
   payload format:
   {
     "is_success": true,
     "user_id": 1,
     "user_name": "Nguyen Van A",
     "rfid_uid": "ABC123456",
     "error_code": null,  // or "USER_NOT_FOUND", "USER_NOT_ACTIVE"
     "time_stamp": "10:30"
   }

Message Flow (Control):
----------------------
1. Admin sends control command via API
2. Server publishes to: esp32/<device_id>/control
   payload format:
   {
     "command": "DOOR_OPEN" | "DOOR_CLOSE" | "RFID_ENABLE" | "RFID_DISABLE",
     "timestamp": "2025-01-13T10:00:00Z",
     "admin_id": 1
   }

3. ESP32 executes command and responds to: esp32/<device_id>/control_response
   payload format:
   {
     "command": "DOOR_OPEN",
     "status": "SUCCESS" | "FAILED",
     "message": "door opened successfully"
   }

Error Codes:
-----------
- USER_NOT_FOUND: rfid_uid does not exist in database
- USER_NOT_ACTIVE: user exists but is_active = false
- null: no error, attendance recorded successfully
"""

import json
import os
from datetime import datetime
from app.extensions import mqtt, db
from app.models import Attendance_logs, User, Device

# chỉ đăng ký mqtt handlers khi không phải là parent process của reloader
# điều này ngăn việc xử lý message 2 lần khi chạy Flask debug mode
if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
    
    # subscribe to dynamic topic: esp32/+/attendance
    # the '+' is a wildcard that matches any device ID
    @mqtt.on_connect()
    def handle_connect(client, userdata, flags, rc):
        """
        handle mqtt broker connection event
        subscribes to esp32/+/attendance and esp32/+/control_response topics
        """
        if rc == 0:
            print('connected to mqtt broker successfully')
            # subscribe to attendance topic for receiving check-in data
            mqtt.subscribe('esp32/+/attendance')
            print('subscribed to topic: esp32/+/attendance')
            # subscribe to control_response topic for receiving device feedback
            mqtt.subscribe('esp32/+/control_response')
            print('subscribed to topic: esp32/+/control_response')
        else:
                print(f'failed to connect to mqtt broker, return code: {rc}')

    @mqtt.on_message()
    def handle_mqtt_message(client, userdata, message):
        """
        handle incoming mqtt messages from esp32 devices
        
        routes messages to appropriate handlers based on topic type:
        - esp32/<device_id>/attendance: attendance check-in data
        - esp32/<device_id>/control_response: device control feedback
        """
        try:
            # extract topic parts
            topic_parts = message.topic.split('/')
            if len(topic_parts) != 3 or topic_parts[0] != 'esp32':
                print(f'invalid topic format: {message.topic}')
                return

            device_id = topic_parts[1]
            topic_type = topic_parts[2]
            payload = json.loads(message.payload.decode())

            # update device last_seen timestamp
            app = mqtt.app
            with app.app_context():
                update_device_last_seen(device_id)

            # route to appropriate handler
            if topic_type == 'attendance':
                handle_attendance_message(device_id, payload)
            elif topic_type == 'control_response':
                handle_control_response_message(device_id, payload)
            else:
                print(f'unknown topic type: {topic_type}')

        except json.JSONDecodeError as e:
            print(f'json decode error: {e}')
        except Exception as e:
            print(f'error processing mqtt message: {e}')


    def update_device_last_seen(device_id):
        """
        update device last_seen timestamp in database
        creates device if not exists
        """
        try:
            device = Device.query.filter_by(device_id=device_id).first()
            if not device:
                # tự động tạo device mới nếu chưa tồn tại
                device = Device(
                    device_id=device_id,
                    name=f'Device {device_id}',
                    is_active=True
                )
                db.session.add(device)
            
            device.last_seen = datetime.utcnow()
            db.session.commit()
            print(f'device {device_id} last_seen updated')
        except Exception as e:
            db.session.rollback()
            print(f'failed to update device last_seen: {e}')


    def handle_attendance_message(device_id, payload):
        """
        handle attendance check-in message from esp32
        
        validates user, saves attendance log, and publishes response
        """
        try:
            # validate required fields
            if 'rfid_uid' not in payload or 'timestamp' not in payload:
                print(f'missing fields in payload from {device_id}')
                return

            # parse timestamp
            timestamp_str = payload['timestamp']
            try:
                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            except Exception as e:
                print(f'invalid timestamp format from device {device_id}: {timestamp_str}')
                return

            # get app instance from mqtt extension
            app = mqtt.app
            with app.app_context():
                # kiểm tra device có được phép quẹt thẻ không
                device = Device.query.filter_by(device_id=device_id).first()
                if device and not device.rfid_enabled:
                    print(f'rfid disabled on device {device_id}, ignoring attendance')
                    # vẫn gửi response về cho ESP32 biết
                    response_topic = f'esp32/{device_id}/response'
                    response_payload = {
                        'is_success': False,
                        'user_id': None,
                        'user_name': None,
                        'rfid_uid': payload['rfid_uid'],
                        'error_code': 'RFID_DISABLED',
                        'time_stamp': datetime.now().strftime('%H:%M')
                    }
                    mqtt.publish(response_topic, json.dumps(response_payload))
                    return

                # kiểm tra user có tồn tại và có active không
                user = User.query.filter_by(rfid_uid=payload['rfid_uid']).first()
                print('user found: ', user)
                error_code = None
                if not user:
                    print(f'user not found from device {device_id}: {payload["rfid_uid"]}')
                    error_code = 'USER_NOT_FOUND'
                elif not user.is_active:
                    print(f'user is not active from device {device_id}: {payload["rfid_uid"]}')
                    error_code = 'USER_NOT_ACTIVE'

                # save attendance log to database
                new_log = Attendance_logs(
                    rfid_uid=payload['rfid_uid'],
                    timestamp=timestamp,
                    device_id=device_id,
                    code=payload.get('code', 'REALTIME'),
                    error_code=error_code
                )
                
                db.session.add(new_log)
                db.session.commit()
                
                print(f'attendance log created: rfid={payload["rfid_uid"]}, device={device_id}, timestamp={timestamp}')
                
                # prepare response message
                response_topic = f'esp32/{device_id}/response'
                response_payload = {
                    'is_success': error_code is None,
                    'user_id': user.id if user else None,
                    'user_name': user.full_name if user else None,
                    'rfid_uid': payload['rfid_uid'],
                    'error_code': error_code,
                    'time_stamp': datetime.now().strftime('%H:%M')
                }
                
                # publish response to esp32
                mqtt.publish(response_topic, json.dumps(response_payload))
                print(f'response published to {response_topic}: {response_payload}')

        except Exception as e:
            app = mqtt.app
            with app.app_context():
                db.session.rollback()
            print(f'error processing attendance message: {e}')


    def handle_control_response_message(device_id, payload):
        """
        handle control command response from esp32
        
        updates device state based on feedback from esp32
        expected payload: {"command": "...", "status": "SUCCESS/FAILED", "message": "..."}
        """
        try:
            command = payload.get('command')
            status = payload.get('status')
            message_text = payload.get('message', '')
            
            print(f'control response from {device_id}: command={command}, status={status}, message={message_text}')
            
            app = mqtt.app
            with app.app_context():
                device = Device.query.filter_by(device_id=device_id).first()
                if not device:
                    print(f'device {device_id} not found in database')
                    return
                
                # chỉ cập nhật state nếu command thành công
                if status == 'SUCCESS':
                    if command == 'DOOR_OPEN':
                        device.door_state = 'OPEN'
                    elif command == 'DOOR_CLOSE':
                        device.door_state = 'CLOSED'
                    elif command == 'RFID_ENABLE':
                        device.rfid_enabled = True
                    elif command == 'RFID_DISABLE':
                        device.rfid_enabled = False
                    elif command == 'DEVICE_ACTIVATE':
                        device.is_active = True
                    elif command == 'DEVICE_DEACTIVATE':
                        device.is_active = False
                    
                    db.session.commit()
                    print(f'device {device_id} state updated: {command}')
                else:
                    print(f'command {command} failed on device {device_id}: {message_text}')

        except Exception as e:
            app = mqtt.app
            with app.app_context():
                db.session.rollback()
            print(f'error processing control response: {e}')

    @mqtt.on_disconnect()   
    def handle_disconnect():
        """
        handle mqtt broker disconnection event
        """
        print('disconnected from mqtt broker')

    @mqtt.on_subscribe()
    def handle_subscribe(client, userdata, mid, granted_qos):
        """
        handle successful topic subscription event
        """
        print(f'subscribed successfully, qos: {granted_qos}')

