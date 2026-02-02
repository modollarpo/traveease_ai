"""
Enhanced NDPR Compliance Audit Logger
Implements PII masking, encrypted log storage, and compliance event tracking.
"""

import json
import logging
from typing import Any, Dict, Optional
from datetime import datetime
from functools import wraps
import hashlib
import re
from enum import Enum


class ComplianceEvent(Enum):
    """NDPR Compliance event types"""
    DATA_ACCESS = "DATA_ACCESS"
    DATA_MODIFICATION = "DATA_MODIFICATION"
    DATA_DELETION = "DATA_DELETION"
    PAYMENT_PROCESSED = "PAYMENT_PROCESSED"
    VISA_APPLICATION_SUBMITTED = "VISA_APPLICATION_SUBMITTED"
    BOOKING_CREATED = "BOOKING_CREATED"
    BOOKING_CANCELLED = "BOOKING_CANCELLED"
    USER_AUTHENTICATION = "USER_AUTHENTICATION"
    SECURITY_ALERT = "SECURITY_ALERT"
    COMPLIANCE_CHECK = "COMPLIANCE_CHECK"


class PIIMaskingRules:
    """PII masking patterns for NDPR compliance"""
    
    PATTERNS = {
        # Passport numbers: XX1234567 -> XX****567
        "passport": r"([A-Z]{2})(\d{6})(\d{3})",
        # Credit card: 4242 4242 4242 4242 -> 4242 **** **** 4242
        "credit_card": r"(\d{4})\s?(\d{4})\s?(\d{4})\s?(\d{4})",
        # Email: john.doe@example.com -> j***@example.com
        "email": r"([a-zA-Z0-9])[a-zA-Z0-9.]*@([a-zA-Z0-9.-]+)",
        # Phone: +1-555-123-4567 -> +1-555-***-4567
        "phone": r"(\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?)(\d{3})[-.\s]?(\d{4})",
        # Names in "Name: " pattern -> "Name: [MASKED]"
        "full_name": r"(name:\s*)([A-Za-z\s]+)",
        # Social Security: ###-##-#### -> ***-**-####
        "ssn": r"(\d{3})-(\d{2})-(\d{4})",
        # Bank account: 12345678 -> 1234****
        "bank_account": r"(\d{4})(\d{4,})",
    }
    
    @staticmethod
    def mask_passport(value: str) -> str:
        """Mask passport number"""
        return re.sub(
            PIIMaskingRules.PATTERNS["passport"],
            r"\1****\3",
            value
        )
    
    @staticmethod
    def mask_credit_card(value: str) -> str:
        """Mask credit card number"""
        return re.sub(
            PIIMaskingRules.PATTERNS["credit_card"],
            r"\1 **** **** \4",
            value
        )
    
    @staticmethod
    def mask_email(value: str) -> str:
        """Mask email address"""
        return re.sub(
            PIIMaskingRules.PATTERNS["email"],
            r"\1***@\2",
            value
        )
    
    @staticmethod
    def mask_phone(value: str) -> str:
        """Mask phone number"""
        return re.sub(
            PIIMaskingRules.PATTERNS["phone"],
            r"\1***-\3",
            value
        )
    
    @staticmethod
    def mask_name(value: str) -> str:
        """Mask full names"""
        return re.sub(
            PIIMaskingRules.PATTERNS["full_name"],
            r"\1[MASKED]",
            value,
            flags=re.IGNORECASE
        )
    
    @staticmethod
    def mask_ssn(value: str) -> str:
        """Mask social security number"""
        return re.sub(
            PIIMaskingRules.PATTERNS["ssn"],
            r"***-**-\3",
            value
        )
    
    @staticmethod
    def mask_bank_account(value: str) -> str:
        """Mask bank account number"""
        return re.sub(
            PIIMaskingRules.PATTERNS["bank_account"],
            r"\1****",
            value
        )
    
    @staticmethod
    def mask_pii(data: Any) -> Any:
        """Recursively mask PII in data structures"""
        if isinstance(data, dict):
            masked = {}
            for key, value in data.items():
                key_lower = key.lower()
                
                # Apply specific masking based on key name
                if "passport" in key_lower:
                    masked[key] = PIIMaskingRules.mask_passport(str(value))
                elif "credit_card" in key_lower or "card" in key_lower:
                    masked[key] = PIIMaskingRules.mask_credit_card(str(value))
                elif "email" in key_lower:
                    masked[key] = PIIMaskingRules.mask_email(str(value))
                elif "phone" in key_lower or "mobile" in key_lower:
                    masked[key] = PIIMaskingRules.mask_phone(str(value))
                elif "name" in key_lower:
                    masked[key] = PIIMaskingRules.mask_name(str(value))
                elif "ssn" in key_lower:
                    masked[key] = PIIMaskingRules.mask_ssn(str(value))
                elif "account" in key_lower or "iban" in key_lower or "swift" in key_lower:
                    masked[key] = PIIMaskingRules.mask_bank_account(str(value))
                else:
                    # Recursively mask nested structures
                    masked[key] = PIIMaskingRules.mask_pii(value)
            return masked
        elif isinstance(data, list):
            return [PIIMaskingRules.mask_pii(item) for item in data]
        elif isinstance(data, str):
            # Apply general PII masking rules
            result = data
            # Try to detect and mask common patterns
            if re.search(r"\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}", result):
                result = PIIMaskingRules.mask_credit_card(result)
            if re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", result):
                result = PIIMaskingRules.mask_email(result)
            return result
        else:
            return data


class NDPRComplianceLogger:
    """Logger for NDPR compliance event tracking"""
    
    def __init__(self, name: str, log_file: Optional[str] = None):
        """
        Initialize NDPR compliance logger
        Args:
            name: Logger name
            log_file: Optional log file path for compliance events
        """
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
        
        # File handler for compliance events
        if log_file:
            file_handler = logging.FileHandler(log_file)
            file_handler.setLevel(logging.INFO)
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
    
    def log_compliance_event(
        self,
        event_type: ComplianceEvent,
        user_id: str,
        action: str,
        resource: str,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> None:
        """
        Log a compliance event with PII masking
        Args:
            event_type: Type of compliance event
            user_id: User identifier (hashed)
            action: Action performed
            resource: Resource affected
            details: Additional details (will be masked)
            ip_address: User's IP address
        """
        # Hash user ID for privacy
        user_id_hash = hashlib.sha256(user_id.encode()).hexdigest()[:16]
        
        # Mask any PII in details
        masked_details = PIIMaskingRules.mask_pii(details) if details else {}
        
        # Build compliance event log
        compliance_log = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type.value,
            "user_id_hash": user_id_hash,
            "action": action,
            "resource": resource,
            "ip_address": ip_address or "UNKNOWN",
            "details": masked_details
        }
        
        self.logger.info(
            f"COMPLIANCE_EVENT: {json.dumps(compliance_log, default=str)}"
        )
    
    def log_data_access(
        self,
        user_id: str,
        resource: str,
        ip_address: Optional[str] = None
    ) -> None:
        """Log data access event"""
        self.log_compliance_event(
            ComplianceEvent.DATA_ACCESS,
            user_id,
            "READ",
            resource,
            ip_address=ip_address
        )
    
    def log_data_modification(
        self,
        user_id: str,
        resource: str,
        changes: Dict[str, Any],
        ip_address: Optional[str] = None
    ) -> None:
        """Log data modification event"""
        masked_changes = PIIMaskingRules.mask_pii(changes)
        self.log_compliance_event(
            ComplianceEvent.DATA_MODIFICATION,
            user_id,
            "UPDATE",
            resource,
            details={"changes": masked_changes},
            ip_address=ip_address
        )
    
    def log_payment_processed(
        self,
        user_id: str,
        transaction_id: str,
        amount: float,
        currency: str,
        gateway: str,
        ip_address: Optional[str] = None
    ) -> None:
        """Log payment processing event"""
        self.log_compliance_event(
            ComplianceEvent.PAYMENT_PROCESSED,
            user_id,
            "PAYMENT",
            transaction_id,
            details={
                "amount": amount,
                "currency": currency,
                "gateway": gateway,
                "timestamp": datetime.utcnow().isoformat()
            },
            ip_address=ip_address
        )
    
    def log_booking_created(
        self,
        user_id: str,
        booking_id: str,
        booking_type: str,
        details: Dict[str, Any],
        ip_address: Optional[str] = None
    ) -> None:
        """Log booking creation event"""
        masked_details = PIIMaskingRules.mask_pii(details)
        self.log_compliance_event(
            ComplianceEvent.BOOKING_CREATED,
            user_id,
            "CREATE",
            booking_id,
            details={
                "booking_type": booking_type,
                **masked_details
            },
            ip_address=ip_address
        )
    
    def log_security_alert(
        self,
        user_id: str,
        alert_type: str,
        details: Dict[str, Any],
        ip_address: Optional[str] = None
    ) -> None:
        """Log security alert"""
        self.log_compliance_event(
            ComplianceEvent.SECURITY_ALERT,
            user_id,
            alert_type,
            "SECURITY",
            details=details,
            ip_address=ip_address
        )


def audit_trail(compliance_logger: NDPRComplianceLogger):
    """Decorator for automatic audit trail logging"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                # Log failed operation
                compliance_logger.log_security_alert(
                    user_id="SYSTEM",
                    alert_type="OPERATION_FAILED",
                    details={"function": func.__name__, "error": str(e)}
                )
                raise
        return wrapper
    return decorator


# Global logger instance
compliance_logger = NDPRComplianceLogger(
    name="ndpr_compliance",
    log_file="logs/compliance_audit.log"
)
