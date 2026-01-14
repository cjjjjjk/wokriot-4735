# swagger api documentation summary

## overview
đã tích hợp swagger ui vào flask server để hiển thị và test các api endpoints.

## access swagger ui
- **url**: http://localhost:5000/apidocs
- **root url** (`/`): tự động redirect đến swagger ui

## documented endpoints

### authentication
- `POST /api/login` - user login with email/password
  - request body: `{"email": "admin", "password": "1"}`
  - response: jwt token + user info

### development
- `GET /api/dev/create-admin` - create default admin account
  - creates admin with email: "admin", password: "1"
  - useful for quick setup in development

### user management
- `POST /api/users` - create new user (admin only)
- `GET /api/users` - get users list with pagination (admin only)
- `GET /api/users/{id}` - get user by id (admin only)
- `GET /api/users/rfid/{rfid_uid}` - get user by rfid (public)
- `GET /api/users/me` - get current user info (authenticated)
- `PUT /api/users/me` - update current user (authenticated)
- `PUT /api/users/{id}` - update user by id (admin only)
- `DELETE /api/users/{id}` - delete user (admin only)

### mqtt integration
- `GET /api/mqtt/info` - get mqtt configuration and documentation
  - mqtt topics information
  - message format examples
  - error codes explanation
  - integration flow diagram

### attendance logs
- `POST /api/attendance-logs` - create new attendance log (authenticated)
- `GET /api/attendance-logs` - get logs list with pagination (admin only)
- `GET /api/attendance-logs/{id}` - get log by id (admin only)
- `PUT /api/attendance-logs/{id}` - update log by id (admin only)
- `DELETE /api/attendance-logs/{id}` - delete log by id (admin only)
- `GET /api/attendance-logs/me` - get current user's logs (authenticated)
  - supports filters: day, month, pagination
- `GET /api/attendance-logs/filter` - get filtered logs (admin only)
  - supports filters: day, month, rfid_uid, device_id, pagination

### work day calculation
- `GET /api/worked-day/month` - get worked days by month (authenticated)
  - query param: month (YYYY-MM), defaults to current month
  - returns daily work data with hours, type, and overtime
- `GET /api/worked-day/day` - get work day for single day (authenticated)
  - query param: date (YYYY-MM-DD), defaults to current date
  - returns work hours, check-in/out times, and overtime

## mqtt handlers documentation
file `mqtt_handlers.py` đã được thêm comprehensive documentation:
- module-level docstring explaining mqtt flow
- function docstrings for each handler
- inline comments for complex logic
- message format examples in comments

## how to use swagger ui

### 1. testing public endpoints
- select endpoint (e.g., `GET /api/dev/create-admin`)
- click "try it out"
- click "execute"
- view response

### 2. testing authenticated endpoints
step 1: get jwt token
- use `POST /api/login` to get token
- example: `{"email": "admin", "password": "1"}`

step 2: authorize
- click "authorize" button (top right)
- enter: `Bearer <your_token>`
- click "authorize"

step 3: test protected endpoints
- now you can test endpoints requiring authentication
- token will be automatically included in requests

### 3. viewing mqtt documentation
- go to `GET /api/mqtt/info`
- click "try it out" → "execute"
- see complete mqtt integration documentation

## features
- interactive api testing
- request/response schema visualization
- jwt bearer authentication support
- api grouping by tags
- example values for all fields
- auto-generated from code docstrings

## adding more documentation
to add swagger docs to new endpoints, add docstring with yaml format:

```python
@api_bp.route('/example', methods=['GET'])
def example():
    """
    endpoint description
    ---
    tags:
      - Tag Name
    parameters:
      - in: query
        name: param_name
        type: string
        required: true
    responses:
      200:
        description: success response
    """
    return jsonify({"message": "example"})
```

## notes
- swagger ui automatically updates when server restarts
- all endpoints with docstrings will appear in swagger ui
- mqtt handlers are background processes, not rest endpoints
- use `GET /api/mqtt/info` to view mqtt documentation
