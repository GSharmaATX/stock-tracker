# Robinhood API Service

Python Flask API service for fetching Robinhood stock holdings.

## Setup

1. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

2. Update `.env` with your Robinhood credentials:

```
ROBINHOOD_EMAIL=your-email@gmail.com
ROBINHOOD_PASSWORD=your-password
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the service:

```bash
python app.py
```

The service will start on `http://localhost:5000`

## Endpoints

### Health Check

```
GET /health
```

### Get Holdings

```
GET /api/robinhood/holdings
```

Returns all current stock positions with quantity, equity, and percent change.

### Get Portfolio

```
GET /api/robinhood/portfolio
```

Returns portfolio summary and account information.

## Notes

- Credentials are loaded from environment variables
- Never commit `.env` file to version control
- If MFA is enabled, you may need to generate an app-specific password
