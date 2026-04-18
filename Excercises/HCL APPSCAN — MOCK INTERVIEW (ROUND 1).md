API to start scan 
user sends POST request to /scan/start with target url and scan type 
response returns scan id and status 
scan starts in queued state 
user can check status later 
if invalid input return 400 
if unauthorized return 401 
if server error return 500 
api key required

# Start a Scan
## Overview
This API starts a scan for a target URL.

## Endpoint
POST /scan/start

## Authentication
An API key is required.

Authorization: API-Key your_api_key

## Request Sample
```json
{
"target_url": "https://example.com",
"scan_type": "full"
}
```
## Response Sample
```json
{
"scan_id": "1234",
"status": "queued"
}
```
## Notes
- Scan starts in queued state. 
- User can check status later.

## Error Handling
|Error Code|Description  |
|----------|-------------|
|400       |Invalid input|
|401       |Unauthorized |
|500       |Server error |
