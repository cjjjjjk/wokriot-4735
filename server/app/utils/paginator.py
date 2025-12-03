# app/utils/paginator.py
from flask import request, jsonify

def paginate_query(query, serialize_func=None):
    """
    Hàm phân trang tái sử dụng cho mọi Model.
    
    Args:
        query: SQLAlchemy BaseQuery object (VD: User.query)
        serialize_func: Hàm để chuyển object thành dict (VD: user.to_dict)
    """
    # 1. Lấy tham số từ URL (Mặc định page 1, 10 item/page)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Giới hạn tối đa per_page để tránh bị tấn công DoS
    if per_page > 100: per_page = 100

    # 2. Sử dụng hàm paginate() có sẵn của Flask-SQLAlchemy
    # error_out=False: Trả về list rỗng thay vì lỗi 404 nếu page quá lớn
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    # 3. Serialize dữ liệu (chuyển Object -> Dict)
    items = pagination.items
    if serialize_func:
        items = [serialize_func(item) for item in items]
    
    # 4. Trả về cấu trúc JSON chuẩn
    return {
        'data': items,
        'meta': {
            'page': page,
            'per_page': per_page,
            'total_items': pagination.total,
            'total_pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }