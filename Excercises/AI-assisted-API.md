# Get Scan Results
## Overview
Retrieve the status and vulnerabilities list for a specific scan by its ID.
## Endpoint
```
GET /scan/{id}
```
## Authentication
An API key is required for all requests.

## Request Example
```GET /scan/abc123```
Headers: {
  "Authorization": "API-Key your_api_key_here"
}
## Response Example
Success – 200 OK
```{
  "scan_id": "abc123",
  "status": "completed",
  "vulnerabilities": [
    {
      "id": "vuln_01",
      "severity": "high",
      "description": "Sample vulnerability description"
    }
  ]
}
```
## Error Handling
|Status Code|Meaning              |Description                         |
|-----------|---------------------|------------------------------------|
|404        |Not Found            |The requested scan ID does not exist|
|500        |Internal Server Error|A server-side error occurred        |
