"""
Flask API service for Robinhood stock holdings
"""
import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
import robin_stocks.robinhood as r

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Robinhood credentials from environment
ROBINHOOD_EMAIL = os.getenv("ROBINHOOD_EMAIL")
ROBINHOOD_PASSWORD = os.getenv("ROBINHOOD_PASSWORD")

# Global login session
robinhood_authenticated = False


def authenticate_robinhood():
    """Authenticate with Robinhood API"""
    global robinhood_authenticated
    try:
        if not ROBINHOOD_EMAIL or not ROBINHOOD_PASSWORD:
            raise ValueError("Missing Robinhood credentials in environment variables")
        
        r.login(ROBINHOOD_EMAIL, ROBINHOOD_PASSWORD)
        robinhood_authenticated = True
        print("Successfully authenticated with Robinhood")
        return True
    except Exception as e:
        print(f"Failed to authenticate with Robinhood: {str(e)}")
        robinhood_authenticated = False
        return False


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"}), 200


@app.route("/api/robinhood/holdings", methods=["GET"])
def get_holdings():
    """Get current stock holdings from Robinhood"""
    try:
        # Authenticate if not already authenticated
        if not robinhood_authenticated:
            if not authenticate_robinhood():
                return jsonify({"error": "Failed to authenticate with Robinhood"}), 401
        
        # Get holdings
        my_stocks = r.build_holdings()
        
        # Format holdings data
        holdings = []
        total_equity = 0
        
        for ticker, details in my_stocks.items():
            holding = {
                "symbol": ticker,
                "quantity": float(details.get("quantity", 0)),
                "averageBuyPrice": float(details.get("average_buy_price", 0)),
                "equity": float(details.get("equity", 0)),
                "percentChange": float(details.get("percent_change", 0)),
                "intraday_return": float(details.get("intraday_return", 0)),
            }
            holdings.append(holding)
            total_equity += holding["equity"]
        
        return jsonify({
            "success": True,
            "holdings": holdings,
            "totalEquity": total_equity,
            "count": len(holdings)
        }), 200
        
    except Exception as e:
        print(f"Error fetching holdings: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/robinhood/portfolio", methods=["GET"])
def get_portfolio():
    """Get portfolio summary from Robinhood"""
    try:
        if not robinhood_authenticated:
            if not authenticate_robinhood():
                return jsonify({"error": "Failed to authenticate with Robinhood"}), 401
        
        # Get account data
        account = r.get_account()
        portfolio = r.get_portfolios()
        
        return jsonify({
            "success": True,
            "account": account,
            "portfolio": portfolio
        }), 200
        
    except Exception as e:
        print(f"Error fetching portfolio: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(debug=os.getenv("FLASK_ENV") == "development", port=port)
