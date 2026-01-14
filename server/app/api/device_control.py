"""
Device Control API for Admin
============================

API này cung cấp các chức năng điều khiển thiết bị ESP32 từ xa cho admin.

MQTT Topic:
-----------
Publish: esp32/<device_id>/control
  - gửi lệnh điều khiển đến thiết bị ESP32

Control Commands:
----------------
1. DOOR_OPEN - Mở cửa
2. DOOR_CLOSE - Đóng cửa
3. RFID_ENABLE - Bật khả năng quẹt thẻ
4. RFID_DISABLE - Tắt khả năng quẹt thẻ
5. DEVICE_ACTIVATE - Kích hoạt thiết bị
6. DEVICE_DEACTIVATE - Vô hiệu hoá thiết bị

Command Payload Format:
----------------------
{
    "command": "DOOR_OPEN",
    "timestamp": "2025-01-13T15:00:00Z",
    "admin_id": 1
}
"""

import json
from datetime import datetime
from flask import request
from . import api_bp
from app.extensions import db, mqtt
from app.models import Device
from app.utils.responses import success_response, error_response
from app.utils.auth_decorators import require_admin


def publish_control_command(device_id, command, admin_id):
    """
    publish control command to esp32 device via mqtt
    
    returns True if publish successful, False otherwise
    """
    try:
        topic = f'esp32/{device_id}/control'
        payload = {
            'command': command,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'admin_id': admin_id
        }
        mqtt.publish(topic, json.dumps(payload))
        print(f'control command published to {topic}: {payload}')
        return True
    except Exception as e:
        print(f'failed to publish control command: {e}')
        return False


def get_or_create_device(device_id):
    """
    lấy device từ database hoặc tạo mới nếu chưa tồn tại
    """
    device = Device.query.filter_by(device_id=device_id).first()
    if not device:
        device = Device(
            device_id=device_id,
            name=f'Device {device_id}',
            is_active=True,
            door_state='CLOSED',
            rfid_enabled=True
        )
        db.session.add(device)
        db.session.commit()
    return device


# api: lấy danh sách tất cả thiết bị
# GET /api/devices
@api_bp.route('/devices', methods=['GET'])
@require_admin
def get_all_devices():
    """
    get all devices (admin only)
    ---
    tags:
      - Device Control
    security:
      - Bearer: []
    responses:
      200:
        description: list of all devices
        schema:
          type: object
          properties:
            is_success:
              type: boolean
              example: true
            data:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  device_id:
                    type: string
                  name:
                    type: string
                  is_active:
                    type: boolean
                  door_state:
                    type: string
                  rfid_enabled:
                    type: boolean
                  last_seen:
                    type: string
      401:
        description: unauthorized
      403:
        description: forbidden - not admin
    """
    try:
        devices = Device.query.all()
        return success_response(
            data=[device.to_dict() for device in devices],
            message='lay danh sach thiet bi thanh cong'
        )
    except Exception as e:
        return error_response(str(e), 'DATABASE_ERROR', 500)


# api: lấy thông tin một thiết bị
# GET /api/devices/<device_id>
@api_bp.route('/devices/<device_id>', methods=['GET'])
@require_admin
def get_device_status(device_id):
    """
    get device status by device_id (admin only)
    ---
    tags:
      - Device Control
    security:
      - Bearer: []
    parameters:
      - in: path
        name: device_id
        type: string
        required: true
        description: device id
    responses:
      200:
        description: device status
        schema:
          type: object
          properties:
            is_success:
              type: boolean
            data:
              type: object
              properties:
                id:
                  type: integer
                device_id:
                  type: string
                name:
                  type: string
                is_active:
                  type: boolean
                door_state:
                  type: string
                rfid_enabled:
                  type: boolean
                last_seen:
                  type: string
      404:
        description: device not found
    """
    try:
        device = Device.query.filter_by(device_id=device_id).first()
        if not device:
            return error_response('thiet bi khong ton tai', 'DEVICE_NOT_FOUND', 404)
        
        return success_response(
            data=device.to_dict(),
            message='lay thong tin thiet bi thanh cong'
        )
    except Exception as e:
        return error_response(str(e), 'DATABASE_ERROR', 500)


# api: điều khiển cửa (mở/đóng)
# POST /api/devices/<device_id>/door
@api_bp.route('/devices/<device_id>/door', methods=['POST'])
@require_admin
def control_door(device_id):
    """
    control door open/close (admin only)
    ---
    tags:
      - Device Control
    security:
      - Bearer: []
    parameters:
      - in: path
        name: device_id
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - action
          properties:
            action:
              type: string
              enum: [OPEN, CLOSE]
              example: "OPEN"
    responses:
      200:
        description: door control command sent
      400:
        description: invalid action
      404:
        description: device not found
    """
    try:
        data = request.get_json()
        if not data or 'action' not in data:
            return error_response('thieu tham so action', 'MISSING_ACTION', 400)
        
        action = data['action'].upper()
        if action not in ['OPEN', 'CLOSE']:
            return error_response('action khong hop le, chi chap nhan OPEN hoac CLOSE', 'INVALID_ACTION', 400)
        
        device = get_or_create_device(device_id)
        
        # cập nhật trạng thái cửa trong database
        device.door_state = 'OPEN' if action == 'OPEN' else 'CLOSED'
        db.session.commit()
        
        # gửi lệnh đến ESP32 qua MQTT
        command = 'DOOR_OPEN' if action == 'OPEN' else 'DOOR_CLOSE'
        admin_id = request.current_user.id
        
        publish_success = publish_control_command(device_id, command, admin_id)
        
        return success_response(
            data={
                'device_id': device_id,
                'door_state': device.door_state,
                'command_sent': command,
                'mqtt_published': publish_success
            },
            message=f'cua da duoc {action.lower()}'
        )
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'CONTROL_ERROR', 500)


# api: bật/tắt khả năng quẹt thẻ RFID
# POST /api/devices/<device_id>/rfid
@api_bp.route('/devices/<device_id>/rfid', methods=['POST'])
@require_admin
def control_rfid(device_id):
    """
    enable/disable rfid card scanning (admin only)
    ---
    tags:
      - Device Control
    security:
      - Bearer: []
    parameters:
      - in: path
        name: device_id
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - enabled
          properties:
            enabled:
              type: boolean
              example: true
    responses:
      200:
        description: rfid control command sent
      400:
        description: invalid parameter
      404:
        description: device not found
    """
    try:
        data = request.get_json()
        if data is None or 'enabled' not in data:
            return error_response('thieu tham so enabled', 'MISSING_ENABLED', 400)
        
        enabled = data['enabled']
        if not isinstance(enabled, bool):
            return error_response('enabled phai la boolean (true/false)', 'INVALID_ENABLED', 400)
        
        device = get_or_create_device(device_id)
        
        # cập nhật trạng thái rfid trong database
        device.rfid_enabled = enabled
        db.session.commit()
        
        # gửi lệnh đến ESP32 qua MQTT
        command = 'RFID_ENABLE' if enabled else 'RFID_DISABLE'
        admin_id = request.current_user.id
        
        publish_success = publish_control_command(device_id, command, admin_id)
        
        return success_response(
            data={
                'device_id': device_id,
                'rfid_enabled': device.rfid_enabled,
                'command_sent': command,
                'mqtt_published': publish_success
            },
            message=f'rfid da duoc {"bat" if enabled else "tat"}'
        )
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'CONTROL_ERROR', 500)


# api: kích hoạt/vô hiệu hoá thiết bị
# POST /api/devices/<device_id>/activate
@api_bp.route('/devices/<device_id>/activate', methods=['POST'])
@require_admin
def control_device_activation(device_id):
    """
    activate/deactivate device (admin only)
    ---
    tags:
      - Device Control
    security:
      - Bearer: []
    parameters:
      - in: path
        name: device_id
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - active
          properties:
            active:
              type: boolean
              example: true
    responses:
      200:
        description: device activation status changed
      400:
        description: invalid parameter
      404:
        description: device not found
    """
    try:
        data = request.get_json()
        if data is None or 'active' not in data:
            return error_response('thieu tham so active', 'MISSING_ACTIVE', 400)
        
        active = data['active']
        if not isinstance(active, bool):
            return error_response('active phai la boolean (true/false)', 'INVALID_ACTIVE', 400)
        
        device = get_or_create_device(device_id)
        
        # cập nhật trạng thái trong database
        device.is_active = active
        db.session.commit()
        
        # gửi lệnh đến ESP32 qua MQTT
        command = 'DEVICE_ACTIVATE' if active else 'DEVICE_DEACTIVATE'
        admin_id = request.current_user.id
        
        publish_success = publish_control_command(device_id, command, admin_id)
        
        return success_response(
            data={
                'device_id': device_id,
                'is_active': device.is_active,
                'command_sent': command,
                'mqtt_published': publish_success
            },
            message=f'thiet bi da duoc {"kich hoat" if active else "vo hieu hoa"}'
        )
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'CONTROL_ERROR', 500)


# api: tạo hoặc cập nhật thiết bị
# PUT /api/devices/<device_id>
@api_bp.route('/devices/<device_id>', methods=['PUT'])
@require_admin
def update_device(device_id):
    """
    create or update device (admin only)
    ---
    tags:
      - Device Control
    security:
      - Bearer: []
    parameters:
      - in: path
        name: device_id
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              example: "Cua chinh"
    responses:
      200:
        description: device updated
      400:
        description: invalid parameter
    """
    try:
        data = request.get_json() or {}
        
        device = Device.query.filter_by(device_id=device_id).first()
        if not device:
            device = Device(
                device_id=device_id,
                name=data.get('name', f'Device {device_id}')
            )
            db.session.add(device)
        else:
            if 'name' in data:
                device.name = data['name']
        
        db.session.commit()
        
        return success_response(
            data=device.to_dict(),
            message='cap nhat thiet bi thanh cong'
        )
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'DATABASE_ERROR', 500)


# api: xoá thiết bị
# DELETE /api/devices/<device_id>
@api_bp.route('/devices/<device_id>', methods=['DELETE'])
@require_admin
def delete_device(device_id):
    """
    delete device (admin only)
    ---
    tags:
      - Device Control
    security:
      - Bearer: []
    parameters:
      - in: path
        name: device_id
        type: string
        required: true
    responses:
      200:
        description: device deleted
      404:
        description: device not found
    """
    try:
        device = Device.query.filter_by(device_id=device_id).first()
        if not device:
            return error_response('thiet bi khong ton tai', 'DEVICE_NOT_FOUND', 404)
        
        db.session.delete(device)
        db.session.commit()
        
        return success_response(
            data={'device_id': device_id},
            message='xoa thiet bi thanh cong'
        )
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'DATABASE_ERROR', 500)
