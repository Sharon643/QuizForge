from slowapi import Limiter
from slowapi.util import get_remote_address


def user_or_ip(request):
    """
    Use the authenticated user's ID when available.
    Fall back to the client's IP address.
    """

    user = getattr(request.state, "user", None)

    if user and isinstance(user, dict):
        return user["id"]

    return get_remote_address(request)


limiter = Limiter(
    key_func=user_or_ip,
    default_limits=["120/minute"],
)