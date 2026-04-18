API to create scan user sends POST request to /scan with target url and scan type 
response gives scan id if invalid url return error 400 if server issue 500 authentication required using api key

# Create a Scan API
## Overview
This API creates a scan specifying a target url and scan type.
## Endpoint
POST /scan
## Request Example
```
</> json
{
"target_url": "https://example.com",
"scan_type": "full"
}
```
## Response example
```
</> JSON
{
"scan_id": "1234"
}
```
## Error Handling
|Error Code|Description|
|----------|------------|
|400       |Invalid URL |
|500       |Server issue|
