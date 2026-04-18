API to update scan user sends PUT request to /scan/{id} with scan type 
response returns updated scan id and status 
if scan not found return 404 if invalid input return 400 api key required

# Update Scan API

## Overview
This API updates the scan type for a specific scan.

## Endpoint
PUT /scan/{id}

## Authentication
API key is required. 

## Request Example
```json
{
  "scan_type": "full"
}
```
## Response Example
```json
{
  "scan_id": "1234",
  "status": "updated",
}
```
## Error Handling
|Error Code |Description    |
|-----------|---------------|
|400        | Invalid input |
|404        | Scan not found|
