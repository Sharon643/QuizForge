from starlette.middleware.base import BaseHTTPMiddleware

from auth.dependencies import verify_jwt


class UserContextMiddleware(BaseHTTPMiddleware):

    async def dispatch(
        self,
        request,
        call_next,
    ):

        request.state.user = None

        auth = request.headers.get("Authorization")

        if auth and auth.startswith("Bearer "):

            token = auth.split(" ", 1)[1]

            try:

                user = verify_jwt(token)

                request.state.user = user

            except Exception:
                pass

        return await call_next(request)