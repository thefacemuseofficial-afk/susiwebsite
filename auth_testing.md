# Auth testing playbook

Supports two auth methods that both produce a `session_token` stored in `user_sessions`:
1. Email + password (JWT-style): POST /api/auth/signup, POST /api/auth/login
2. Google Identity Services: POST /api/auth/google { credential }

Auth dependency checks `session_token` cookie first, then `Authorization: Bearer <token>`.

## Create test user + session (mongosh)
```
mongosh --eval "use('test_database'); var u='test-user-'+Date.now(); var t='test_session_'+Date.now(); db.users.insertOne({user_id:u,email:'t'+Date.now()+'@ex.com',name:'Test',is_subscribed:false,created_at:new Date()}); db.user_sessions.insertOne({user_id:u,session_token:t,expires_at:new Date(Date.now()+7*24*3600*1000),created_at:new Date()}); print(t);"
```
Test: curl -H "Authorization: Bearer <token>" .../api/auth/me
