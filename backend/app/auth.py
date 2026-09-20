from datetime import timedelta
import jwt
from fastapi import Depends, HTTPException, Request, Response
from pwdlib import PasswordHash
from sqlalchemy.orm import Session
from .config import settings
from .db import get_db
from .models import User, now

passwords = PasswordHash.recommended()
dummy_hash = passwords.hash('constant-time-missing-user-check')


def set_session(response: Response, user: User):
    token = jwt.encode({'sub': user.id, 'ver': user.token_version, 'exp': now() + timedelta(hours=12), 'iat': now(), 'iss': 'celebratecg', 'aud': 'celebratecg'}, settings().jwt_secret, algorithm='HS256')
    response.set_cookie('cg_session', token, httponly=True, secure=settings().app_env == 'production', samesite='lax', max_age=43200, path='/')


def current_user(request: Request, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(request.cookies.get('cg_session', ''), settings().jwt_secret, algorithms=['HS256'], issuer='celebratecg', audience='celebratecg', options={'require': ['exp', 'iat', 'sub', 'ver']})
        user = db.get(User, payload['sub'])
        if not user or payload['ver'] != user.token_version:
            raise ValueError()
        return user
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(401, 'Please sign in to continue.')


def role(required: str):
    def dependency(user: User = Depends(current_user)):
        if user.role != required:
            raise HTTPException(403, 'You do not have access to this action.')
        if required == 'vendor' and user.approval_status != 'approved':
            raise HTTPException(403, 'Your vendor account is awaiting admin approval.')
        return user
    return dependency


def user_view(user: User):
    return {'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role, 'approval_status': user.approval_status}
