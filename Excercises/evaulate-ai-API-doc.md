# Delete Scan
## Overview
Delete a specific scan by its ID.

## Endpoint
DELETE /scan/{id}

## Authentication
An API key is required.
## Response Example
Success (200 OK)
```
json
{
  "message": "success"
}
```
## Error Handling
|Error Code|Description   |
|----------|--------------|
|404       |Scan not found|
|500       |Server error  |
