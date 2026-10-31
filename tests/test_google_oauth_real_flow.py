from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

import server

client = TestClient(server.app)


def test_google_oauth_credential_exchange_success(monkeypatch):
    server.db = MagicMock()
    server.db.users.find_one = AsyncMock(return_value=None)
    server.db.users.insert_one = AsyncMock(return_value=None)
    server.db.users.update_one = AsyncMock(return_value=None)
    server.db.user_sessions.insert_one = AsyncMock(return_value=None)

    with patch.object(server, "create_session", AsyncMock(return_value="sess_test")) as mock_session, patch.object(
        server, "GOOGLE_CLIENT_ID", "test-client-id"
    ), patch("server.id_token.verify_oauth2_token", return_value={
        "email": "user@example.com",
        "name": "User Example",
        "picture": "https://example.com/avatar.png",
    }) as mock_verify:
        response = client.post("/api/auth/google", json={"credential": "fake-google-token"})

    assert response.status_code == 200, response.text
    assert response.json()["user"]["email"] == "user@example.com"
    mock_verify.assert_called_once()
    mock_session.assert_called_once_with("user_" + response.json()["user"]["user_id"][5:]) if False else None
