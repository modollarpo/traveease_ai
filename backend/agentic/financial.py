import requests

class FinancialAgent:
    def convert_prices(self, logistics_result, culture_result):
        # Fetch live exchange rates (stub)
        rates = {
            "NGN": 1,
            "USD": 0.001,
            "EUR": 0.0009
        }
        # Example: sum all item prices and convert
        total_price_ngn = 100000  # stub value
        return {
            "NGN": total_price_ngn,
            "USD": int(total_price_ngn * rates["USD"]),
            "EUR": int(total_price_ngn * rates["EUR"])
        }
