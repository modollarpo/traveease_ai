import logging

# Configure NDPR-compliant logging
class NDPRLogger:
    @staticmethod
    def mask_pii(data: dict) -> dict:
        masked = {}
        for k, v in data.items():
            if k in ['passport', 'name', 'card', 'credit_card', 'email']:
                masked[k] = '***MASKED***'
            else:
                masked[k] = v
        return masked

    @staticmethod
    def info(msg, data=None):
        if data:
            msg += f" | {NDPRLogger.mask_pii(data)}"
        logging.info(msg)

    @staticmethod
    def error(msg, data=None):
        if data:
            msg += f" | {NDPRLogger.mask_pii(data)}"
        logging.error(msg)
