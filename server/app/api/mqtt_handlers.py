import json
import os
from datetime import datetime
from app.extensions import mqtt, db
from app.models import Attendance_logs, User

# chỉ đăng ký mqtt handlers khi không phải là parent process của reloader
# điều này ngăn việc xử lý message 2 lần khi chạy Flask debug mode
if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
    
    # subscribe to dynamic topic: esp32/+/attendance
    # the '+' is a wildcard that matches any device ID
    @mqtt.on_connect()
    def handle_connect(client, userdata, flags, rc):
        if rc == 0:
            print('connected to mqtt broker successfully')
            mqtt.subscribe('esp32/+/attendance')
            print('subscribed to topic: esp32/+/attendance')
        else:
                print(f'failed to connect to mqtt broker, return code: {rc}')

    @mqtt.on_message()
    def handle_mqtt_message(client, userdata, message):
        try:
            topic_parts = message.topic.split('/')
            if len(topic_parts) != 3 or topic_parts[0] != 'esp32' or topic_parts[2] != 'attendance':
                print(f'invalid topic format: {message.topic}')
                return

            device_id = topic_parts[1]
            payload = json.loads(message.payload.decode())

            if 'rfid_uid' not in payload or 'timestamp' not in payload:
                print(f'missing fields in payload from {device_id}')
                return

            timestamp_str = payload['timestamp']
            try:
                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            except Exception as e:
                print(f'invalid timestamp format from device {device_id}: {timestamp_str}')
                return

            # get app instance from mqtt extension
            app = mqtt.app
            with app.app_context():
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

        except json.JSONDecodeError as e:
            print(f'json decode error: {e}')
        except Exception as e:
            app = mqtt.app
            with app.app_context():
                db.session.rollback()
            print(f'error processing mqtt message: {e}')

    @mqtt.on_disconnect()   
    def handle_disconnect():
        print('disconnected from mqtt broker')

    @mqtt.on_subscribe()
    def handle_subscribe(client, userdata, mid, granted_qos):
        print(f'subscribed successfully, qos: {granted_qos}')

