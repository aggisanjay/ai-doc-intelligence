from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token


class AuthService:

    @staticmethod
    async def register(data: UserRegister, db: AsyncSession) -> TokenResponse:
        result = await db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            role="user",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        token = create_access_token(user.id, user.role)
        return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

    @staticmethod
    async def login(data: UserLogin, db: AsyncSession) -> TokenResponse:
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

        token = create_access_token(user.id, user.role)
        return TokenResponse(access_token=token, user=UserResponse.model_validate(user))
